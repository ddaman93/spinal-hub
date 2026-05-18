import type { Request, Response } from "express";
import { db } from "../db";
import { careRelationships, inviteCodes, users, userProfiles, pressureInjuries, careNotes, handoverReads } from "@shared/schema";
import { eq, and, count, desc, inArray } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";

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

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invite] = await db.insert(inviteCodes).values({
    code,
    patientId,
    role,
    expiresAt,
  }).returning();

  res.json({ code: invite.code, expiresAt: invite.expiresAt, role: invite.role });
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

  // Create the relationship
  await db.insert(careRelationships).values({
    patientId: invite.patientId,
    caregiverId,
    role: invite.role,
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
