import type { Request, Response } from "express";
import { db } from "../db";
import { careRelationships, inviteCodes, users, userProfiles, pressureInjuries, careNotes, handoverReads, medicationLogs, rehabGoals, auditLogs } from "@shared/schema";

function profileRoleToRelationshipRole(profileRole: string | null | undefined): string | null {
  if (profileRole === "health_professional") return "clinician";
  if (profileRole === "family_member") return "family";
  if (profileRole === "caregiver") return "carer";
  return null; // sci_patient or unknown — caller uses invite role fallback
}
import { eq, and, count, desc, inArray, notInArray, sql, gte } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";
import { addAuditLog } from "./audit";

function requireAuth(req: Request, res: Response): string | null {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ message: "Unauthorized." }); return null; }
  try {
    return verifyToken(token).id;
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
    return null;
  }
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /api/care/invite — patient generates an invite code
export async function createInvite(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const { role = "carer" } = req.body;
  if (!["carer", "family", "clinician"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  try {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invite] = await db.insert(inviteCodes).values({
      code,
      patientId,
      role,
      expiresAt,
    }).returning();

    res.json({ code: invite.code, expiresAt: invite.expiresAt, role: invite.role });
  } catch (err) {
    console.error("createInvite error:", err);
    res.status(500).json({ message: "Failed to create invite code." });
  }
}

// POST /api/care/join — carer/family/clinician accepts an invite code
export async function joinWithCode(req: Request, res: Response) {
  const caregiverId = requireAuth(req, res);
  if (!caregiverId) return;

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Code is required." });

  const [invite] = await db.select().from(inviteCodes)
    .where(eq(inviteCodes.code, code.toUpperCase().trim()));

  if (!invite) return res.status(404).json({ message: "Invite code not found." });
  if (invite.usedAt) return res.status(400).json({ message: "This code has already been used." });
  if (new Date() > invite.expiresAt) return res.status(400).json({ message: "This code has expired." });
  if (invite.patientId === caregiverId) return res.status(400).json({ message: "You cannot link to yourself." });

  // Check if relationship already exists
  const [existing] = await db.select().from(careRelationships).where(
    and(eq(careRelationships.patientId, invite.patientId), eq(careRelationships.caregiverId, caregiverId))
  );
  if (existing) return res.status(400).json({ message: "You are already linked to this patient." });

  // Derive role from joiner's profile — patient's invite role is the fallback
  const [joinerProfile] = await db.select({ role: userProfiles.role }).from(userProfiles).where(eq(userProfiles.userId, caregiverId));
  const derivedRole = profileRoleToRelationshipRole(joinerProfile?.role) ?? invite.role;

  // Create the relationship
  await db.insert(careRelationships).values({
    patientId: invite.patientId,
    caregiverId,
    role: derivedRole,
  });

  // Mark code as used
  await db.update(inviteCodes).set({ usedAt: new Date(), usedById: caregiverId })
    .where(eq(inviteCodes.id, invite.id));

  // Return the patient's name so the carer knows who they linked to
  const [patient] = await db.select({ name: users.name }).from(users).where(eq(users.id, invite.patientId));

  res.json({ message: "Linked successfully.", patientName: patient?.name, role: invite.role });
}

// GET /api/care/relationships — get all relationships for the current user
export async function getRelationships(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  // Relationships where I am the patient
  const asPatient = await db.select({
    id: careRelationships.id,
    role: careRelationships.role,
    status: careRelationships.status,
    createdAt: careRelationships.createdAt,
    caregiver: { id: users.id, name: users.name, email: users.email },
  }).from(careRelationships)
    .innerJoin(users, eq(careRelationships.caregiverId, users.id))
    .where(and(eq(careRelationships.patientId, userId), eq(careRelationships.status, "active")));

  // Relationships where I am the carer/family/clinician
  const asCarer = await db.select({
    id: careRelationships.id,
    role: careRelationships.role,
    status: careRelationships.status,
    createdAt: careRelationships.createdAt,
    patient: { id: users.id, name: users.name, email: users.email },
  }).from(careRelationships)
    .innerJoin(users, eq(careRelationships.patientId, users.id))
    .where(and(eq(careRelationships.caregiverId, userId), eq(careRelationships.status, "active")));

  res.json({ asPatient, asCarer });
}

// DELETE /api/care/relationships/:id — revoke a relationship (patient only)
export async function revokeRelationship(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { id } = req.params;
  const [rel] = await db.select().from(careRelationships).where(eq(careRelationships.id, id));
  if (!rel) return res.status(404).json({ message: "Relationship not found." });

  // Only the patient or the caregiver themselves can revoke
  if (rel.patientId !== userId && rel.caregiverId !== userId) {
    return res.status(403).json({ message: "Forbidden." });
  }

  await db.update(careRelationships).set({ status: "revoked" }).where(eq(careRelationships.id, id));
  res.json({ message: "Relationship revoked." });
}

// Middleware helper — verify the requesting user has access to a patient's data
export async function canAccessPatient(requesterId: string, patientId: string): Promise<boolean> {
  if (requesterId === patientId) return true;
  const [rel] = await db.select().from(careRelationships).where(
    and(
      eq(careRelationships.patientId, patientId),
      eq(careRelationships.caregiverId, requesterId),
      eq(careRelationships.status, "active")
    )
  );
  return !!rel;
}

// Returns the requester's role relative to the patient ("patient" | "carer" | "family" | "clinician" | null)
export async function getCarerRole(requesterId: string, patientId: string): Promise<string | null> {
  if (requesterId === patientId) return "patient";
  const [rel] = await db
    .select({ role: careRelationships.role })
    .from(careRelationships)
    .where(
      and(
        eq(careRelationships.patientId, patientId),
        eq(careRelationships.caregiverId, requesterId),
        eq(careRelationships.status, "active")
      )
    );
  return rel?.role ?? null;
}

// GET /api/care/patients — patients I support with summary data
export async function getMyPatients(req: Request, res: Response) {
  const caregiverId = requireAuth(req, res);
  if (!caregiverId) return;

  const rels = await db
    .select({
      relationshipId: careRelationships.id,
      role: careRelationships.role,
      linkedAt: careRelationships.createdAt,
      patientId: users.id,
      patientName: users.name,
      injuryLevel: userProfiles.injuryLevel,
      injuryType: userProfiles.injuryType,
      aboutMe: userProfiles.aboutMe,
    })
    .from(careRelationships)
    .innerJoin(users, eq(careRelationships.patientId, users.id))
    .leftJoin(userProfiles, eq(careRelationships.patientId, userProfiles.userId))
    .where(and(eq(careRelationships.caregiverId, caregiverId), eq(careRelationships.status, "active")));

  // Count active wounds per patient
  const patients = await Promise.all(
    rels.map(async (rel) => {
      const [woundRow] = await db
        .select({ activeWounds: count() })
        .from(pressureInjuries)
        .where(and(eq(pressureInjuries.patientId, rel.patientId), eq(pressureInjuries.status, "active")));
      return { ...rel, activeWoundCount: Number(woundRow?.activeWounds ?? 0) };
    })
  );

  res.json(patients);
}

// GET /api/care/patients/alerts — alert counts per patient for dashboard
export async function getPatientAlerts(req: Request, res: Response) {
  const caregiverId = requireAuth(req, res);
  if (!caregiverId) return;

  // Get my active patient IDs
  const rels = await db
    .select({ patientId: careRelationships.patientId })
    .from(careRelationships)
    .where(and(eq(careRelationships.caregiverId, caregiverId), eq(careRelationships.status, "active")));

  if (rels.length === 0) return res.json([]);

  const patientIds = rels.map((r) => r.patientId);

  // All notes for these patients
  const allNotes = await db
    .select({ id: careNotes.id, patientId: careNotes.patientId })
    .from(careNotes)
    .where(inArray(careNotes.patientId, patientIds));

  // Notes this carer has read
  const noteIds = allNotes.map((n) => n.id);
  const myReads = noteIds.length > 0
    ? await db.select({ noteId: handoverReads.noteId }).from(handoverReads)
        .where(and(inArray(handoverReads.noteId, noteIds), eq(handoverReads.readerId, caregiverId)))
    : [];
  const readNoteIds = new Set(myReads.map((r) => r.noteId));

  // Unread count per patient
  const unreadByPatient: Record<string, number> = {};
  for (const n of allNotes) {
    if (!readNoteIds.has(n.id)) {
      unreadByPatient[n.patientId] = (unreadByPatient[n.patientId] ?? 0) + 1;
    }
  }

  // Critical wound count per patient — join latest check per wound
  // Raw SQL: active wounds whose most recent check has Stage III/IV/Unstageable/DTI
  const pgIds = `{${patientIds.join(",")}}`;
  const criticalWounds = await db.execute(sql`
    SELECT pi.patient_id, COUNT(*)::int AS cnt
    FROM pressure_injuries pi
    INNER JOIN LATERAL (
      SELECT stage FROM pressure_injury_checks
      WHERE injury_id = pi.id
      ORDER BY created_at DESC
      LIMIT 1
    ) latest ON true
    WHERE pi.patient_id = ANY(${pgIds}::varchar[])
      AND pi.status = 'active'
      AND latest.stage IN ('III', 'IV', 'Unstageable', 'DTI')
    GROUP BY pi.patient_id
  `);

  const criticalByPatient: Record<string, number> = {};
  for (const r of criticalWounds.rows as any[]) criticalByPatient[r.patient_id] = Number(r.cnt);

  const result = patientIds.map((pid) => ({
    patientId: pid,
    unreadNotes: unreadByPatient[pid] ?? 0,
    criticalWounds: criticalByPatient[pid] ?? 0,
    totalAlerts: (unreadByPatient[pid] ?? 0) + (criticalByPatient[pid] ?? 0),
  }));

  res.json(result);
}

// GET /api/care/notes/:patientId — handover notes + read receipts (newest first)
export async function getCareNotes(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId } = req.params;
  if (!(await canAccessPatient(requesterId, patientId))) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const notes = await db
    .select()
    .from(careNotes)
    .where(eq(careNotes.patientId, patientId))
    .orderBy(desc(careNotes.createdAt))
    .limit(50);

  if (notes.length === 0) return res.json([]);

  const noteIds = notes.map((n) => n.id);
  const reads = await db
    .select()
    .from(handoverReads)
    .where(inArray(handoverReads.noteId, noteIds));

  const readsByNote: Record<string, { readerId: string; readerName: string; readAt: Date }[]> = {};
  for (const r of reads) {
    if (!readsByNote[r.noteId]) readsByNote[r.noteId] = [];
    readsByNote[r.noteId].push({ readerId: r.readerId, readerName: r.readerName, readAt: r.readAt });
  }

  res.json(notes.map((n) => ({ ...n, reads: readsByNote[n.id] ?? [] })));
}

// POST /api/care/notes/:patientId — add a handover note (free_text or isbar)
export async function addCareNote(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId } = req.params;
  if (!(await canAccessPatient(requesterId, patientId))) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const { content, noteType, shiftType, situation, background, assessment, recommendation } = req.body;

  const isIsbar = noteType === "isbar";
  if (isIsbar && !situation?.trim()) return res.status(400).json({ message: "Situation is required for ISBAR notes." });
  if (!isIsbar && !content?.trim()) return res.status(400).json({ message: "Content required." });

  const [author] = await db.select({ name: users.name }).from(users).where(eq(users.id, requesterId));

  const [note] = await db
    .insert(careNotes)
    .values({
      patientId,
      authorId: requesterId,
      authorName: author?.name ?? "Unknown",
      noteType: noteType ?? "free_text",
      content: isIsbar ? "" : content.trim(),
      shiftType: shiftType ?? null,
      situation: situation?.trim() ?? null,
      background: background?.trim() ?? null,
      assessment: assessment?.trim() ?? null,
      recommendation: recommendation?.trim() ?? null,
    })
    .returning();

  const shift = shiftType ? ` (${shiftType} shift)` : "";
  const typeSummary = isIsbar ? `ISBAR handover${shift}` : `Care note${shift}`;
  await addAuditLog({ patientId, actorId: requesterId, actorName: author?.name ?? "Unknown", action: "created", entityType: "care_note", entityId: note.id, summary: typeSummary });

  res.status(201).json({ ...note, reads: [] });
}

// POST /api/care/notes/:noteId/read — mark a note as read by the requester
export async function markNoteRead(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { noteId } = req.params;
  const [note] = await db.select().from(careNotes).where(eq(careNotes.id, noteId));
  if (!note) return res.status(404).json({ message: "Not found." });

  if (!(await canAccessPatient(requesterId, note.patientId))) {
    return res.status(403).json({ message: "Forbidden." });
  }

  // Idempotent — only insert if not already read
  const [existing] = await db.select().from(handoverReads).where(
    and(eq(handoverReads.noteId, noteId), eq(handoverReads.readerId, requesterId))
  );
  if (existing) return res.json(existing);

  const [reader] = await db.select({ name: users.name }).from(users).where(eq(users.id, requesterId));
  const [read] = await db.insert(handoverReads).values({
    noteId,
    readerId: requesterId,
    readerName: reader?.name ?? "Unknown",
  }).returning();

  res.status(201).json(read);
}

// GET /api/care/profile/:patientId — patient profile visible to linked carers
export async function getPatientProfile(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId } = req.params;
  if (!(await canAccessPatient(requesterId, patientId))) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, patientId))
    .limit(1);

  res.json(profile ?? null);
}

// Called from POST /api/profile — sync relationship roles when user changes their profile role
export async function syncRelationshipRolesForUser(userId: string, newProfileRole: string): Promise<void> {
  const relRole = profileRoleToRelationshipRole(newProfileRole);
  if (!relRole) return; // sci_patient — no sync needed
  await db.update(careRelationships)
    .set({ role: relRole })
    .where(and(eq(careRelationships.caregiverId, userId), eq(careRelationships.status, "active")));
}

// GET /api/care/org-report — aggregate stats across all patients for a carer/org
export async function getOrgReport(req: Request, res: Response) {
  const caregiverId = requireAuth(req, res);
  if (!caregiverId) return;

  const rels = await db
    .select({ patientId: careRelationships.patientId, patientName: users.name })
    .from(careRelationships)
    .innerJoin(users, eq(careRelationships.patientId, users.id))
    .where(and(eq(careRelationships.caregiverId, caregiverId), eq(careRelationships.status, "active")));

  if (rels.length === 0) {
    return res.json({
      patientCount: 0, activeWounds: 0, criticalWounds: 0,
      medAdherence7d: null, rehabGoalsActive: 0, rehabGoalsAchieved: 0,
      recentEvents: [], patientSummaries: [],
    });
  }

  const patientIds = rels.map((r) => r.patientId);
  const patientNames: Record<string, string> = {};
  for (const r of rels) patientNames[r.patientId] = r.patientName;

  // Active wounds
  const [woundRow] = await db
    .select({ cnt: count() })
    .from(pressureInjuries)
    .where(and(inArray(pressureInjuries.patientId, patientIds), eq(pressureInjuries.status, "active")));

  // Critical wounds via LATERAL
  const pgIds2 = `{${patientIds.join(",")}}`;
  const criticalResult = await db.execute(sql`
    SELECT COUNT(*)::int AS cnt
    FROM pressure_injuries pi
    INNER JOIN LATERAL (
      SELECT stage FROM pressure_injury_checks
      WHERE injury_id = pi.id ORDER BY created_at DESC LIMIT 1
    ) latest ON true
    WHERE pi.patient_id = ANY(${pgIds2}::varchar[])
      AND pi.status = 'active'
      AND latest.stage IN ('III', 'IV', 'Unstageable', 'DTI')
  `);

  // Medication adherence last 7 days
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since7dStr = since7d.toISOString().slice(0, 10); // YYYY-MM-DD
  const medLogs = await db
    .select({ taken: medicationLogs.taken })
    .from(medicationLogs)
    .where(and(inArray(medicationLogs.patientId, patientIds), gte(medicationLogs.date, since7dStr)));

  const totalLogged = medLogs.length;
  const takenCount = medLogs.filter((l) => l.taken).length;
  const medAdherence7d = totalLogged > 0 ? Math.round((takenCount / totalLogged) * 100) : null;

  // Rehab goals by status
  const goalRows = await db
    .select({ status: rehabGoals.status, cnt: count() })
    .from(rehabGoals)
    .where(inArray(rehabGoals.patientId, patientIds))
    .groupBy(rehabGoals.status);

  const rehabGoalsActive = Number(goalRows.find((g) => g.status === "active")?.cnt ?? 0);
  const rehabGoalsAchieved = Number(goalRows.find((g) => g.status === "achieved")?.cnt ?? 0);

  // Recent audit events across all patients (last 20)
  const events = await db
    .select()
    .from(auditLogs)
    .where(inArray(auditLogs.patientId, patientIds))
    .orderBy(desc(auditLogs.createdAt))
    .limit(20);

  const recentEvents = events.map((e) => ({
    ...e,
    patientName: patientNames[e.patientId] ?? "Unknown",
  }));

  // Per-patient wound counts for summary table
  const woundsByPatient = await db
    .select({ patientId: pressureInjuries.patientId, cnt: count() })
    .from(pressureInjuries)
    .where(and(inArray(pressureInjuries.patientId, patientIds), eq(pressureInjuries.status, "active")))
    .groupBy(pressureInjuries.patientId);
  const woundMap: Record<string, number> = {};
  for (const w of woundsByPatient) woundMap[w.patientId] = Number(w.cnt);

  const patientSummaries = rels.map((r) => ({
    patientId: r.patientId,
    patientName: r.patientName,
    activeWounds: woundMap[r.patientId] ?? 0,
  }));

  res.json({
    patientCount: rels.length,
    activeWounds: Number(woundRow?.cnt ?? 0),
    criticalWounds: Number((criticalResult.rows[0] as any)?.cnt ?? 0),
    medAdherence7d,
    rehabGoalsActive,
    rehabGoalsAchieved,
    recentEvents,
    patientSummaries,
  });
}
