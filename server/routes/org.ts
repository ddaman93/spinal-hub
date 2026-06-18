import type { Request, Response } from "express";
import { db } from "../db";
import {
  organizations, orgMembers, orgPatients, staffAssignments, careRelationships, users, inviteCodes,
} from "@shared/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";

function requireAuth(req: Request, res: Response): string | null {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ message: "Unauthorized." }); return null; }
  try { return verifyToken(token).id; }
  catch { res.status(401).json({ message: "Invalid or expired token." }); return null; }
}

// Returns the requester's org membership for a given org, or null.
async function getOrgMembership(userId: string, orgId: string) {
  const [m] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId), eq(orgMembers.status, "active")));
  return m ?? null;
}

// POST /api/org — create an org; caller becomes owner
export async function createOrg(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { name, type = "care_company" } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Org name required." });
  if (!["care_company", "rehab", "acc_vendor"].includes(type)) {
    return res.status(400).json({ message: "Invalid org type." });
  }

  const [org] = await db.insert(organizations).values({ name: name.trim(), type }).returning();
  await db.insert(orgMembers).values({ orgId: org.id, userId, role: "owner" });

  res.status(201).json(org);
}

// GET /api/org — orgs the current user belongs to
export async function getMyOrgs(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const memberships = await db
    .select({
      orgId: orgMembers.orgId,
      memberRole: orgMembers.role,
      joinedAt: orgMembers.createdAt,
      orgName: organizations.name,
      orgType: organizations.type,
      orgCreatedAt: organizations.createdAt,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
    .where(and(eq(orgMembers.userId, userId), eq(orgMembers.status, "active")));

  res.json(memberships.map((m) => ({
    id: m.orgId,
    name: m.orgName,
    type: m.orgType,
    createdAt: m.orgCreatedAt,
    myRole: m.memberRole,
    joinedAt: m.joinedAt,
  })));
}

// GET /api/org/:orgId — org detail + members + patients
export async function getOrg(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId } = req.params;
  const membership = await getOrgMembership(userId, orgId);
  if (!membership) return res.status(403).json({ message: "Not a member of this org." });

  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
  if (!org) return res.status(404).json({ message: "Org not found." });

  const members = await db
    .select({
      id: orgMembers.id,
      userId: orgMembers.userId,
      role: orgMembers.role,
      status: orgMembers.status,
      joinedAt: orgMembers.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.status, "active")));

  const patients = await db
    .select({
      id: orgPatients.id,
      patientId: orgPatients.patientId,
      status: orgPatients.status,
      addedAt: orgPatients.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(orgPatients)
    .innerJoin(users, eq(orgPatients.patientId, users.id))
    .where(and(eq(orgPatients.orgId, orgId), eq(orgPatients.status, "active")));

  res.json({ ...org, myRole: membership.role, members, patients });
}

// POST /api/org/:orgId/invite-member — generate an invite code for a new staff member
// Reuses the existing invite_codes table but with orgId in the role field encoded as "org:<orgId>:<role>"
export async function inviteMember(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId } = req.params;
  const { role = "staff" } = req.body;

  if (!["admin", "staff"].includes(role)) return res.status(400).json({ message: "Role must be admin or staff." });

  const membership = await getOrgMembership(userId, orgId);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ message: "Only org admins can invite members." });
  }

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Encode org invite in patientId field + role field as "org_member:<orgId>:<role>"
  // We use a special marker so join handler can distinguish org invites from patient invites.
  const [invite] = await db.insert(inviteCodes).values({
    code,
    patientId: userId, // sender — org join doesn't use patient relationship model
    role: `org_member:${orgId}:${role}`,
    expiresAt,
  }).returning();

  res.json({ code: invite.code, expiresAt: invite.expiresAt, role });
}

// POST /api/org/join — accept an org member invite code
export async function joinOrg(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Code required." });

  const [invite] = await db.select().from(inviteCodes)
    .where(eq(inviteCodes.code, code.toUpperCase().trim()));

  if (!invite) return res.status(404).json({ message: "Invite code not found." });
  if (invite.usedAt) return res.status(400).json({ message: "Code already used." });
  if (new Date() > invite.expiresAt) return res.status(400).json({ message: "Code expired." });
  if (!invite.role.startsWith("org_member:")) {
    return res.status(400).json({ message: "Not an org invite code." });
  }

  const parts = invite.role.split(":");
  const orgId = parts[1];
  const memberRole = parts[2] ?? "staff";

  const existing = await getOrgMembership(userId, orgId);
  if (existing) return res.status(400).json({ message: "Already a member of this org." });

  await db.insert(orgMembers).values({ orgId, userId, role: memberRole });
  await db.update(inviteCodes).set({ usedAt: new Date(), usedById: userId })
    .where(eq(inviteCodes.id, invite.id));

  const [org] = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, orgId));
  res.json({ message: "Joined org.", orgName: org?.name, role: memberRole });
}

// POST /api/org/:orgId/patients — add a patient to org roster (by patient invite code)
export async function addOrgPatient(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId } = req.params;
  const { code } = req.body;

  const membership = await getOrgMembership(userId, orgId);
  if (!membership || !["owner", "admin", "staff"].includes(membership.role)) {
    return res.status(403).json({ message: "Not an org member." });
  }

  if (!code) return res.status(400).json({ message: "Patient invite code required." });

  const [invite] = await db.select().from(inviteCodes)
    .where(eq(inviteCodes.code, code.toUpperCase().trim()));

  if (!invite) return res.status(404).json({ message: "Code not found." });
  if (invite.usedAt) return res.status(400).json({ message: "Code already used." });
  if (new Date() > invite.expiresAt) return res.status(400).json({ message: "Code expired." });
  if (invite.role.startsWith("org_member:")) {
    return res.status(400).json({ message: "That's a staff invite, not a patient invite." });
  }

  const patientId = invite.patientId;

  // Check patient not already on roster
  const [existing] = await db.select().from(orgPatients)
    .where(and(eq(orgPatients.orgId, orgId), eq(orgPatients.patientId, patientId)));
  if (existing) {
    if (existing.status === "discharged") {
      await db.update(orgPatients).set({ status: "active" }).where(eq(orgPatients.id, existing.id));
      return res.json({ message: "Patient re-activated on roster." });
    }
    return res.status(400).json({ message: "Patient already on org roster." });
  }

  await db.insert(orgPatients).values({ orgId, patientId, addedBy: userId });
  await db.update(inviteCodes).set({ usedAt: new Date(), usedById: userId })
    .where(eq(inviteCodes.id, invite.id));

  const [patient] = await db.select({ name: users.name }).from(users).where(eq(users.id, patientId));
  res.status(201).json({ message: "Patient added to org.", patientName: patient?.name });
}

// DELETE /api/org/:orgId/patients/:patientId — discharge a patient
export async function dischargeOrgPatient(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId, patientId } = req.params;
  const membership = await getOrgMembership(userId, orgId);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ message: "Only org admins can discharge patients." });
  }

  await db.update(orgPatients).set({ status: "discharged" })
    .where(and(eq(orgPatients.orgId, orgId), eq(orgPatients.patientId, patientId)));

  res.json({ message: "Patient discharged." });
}

// POST /api/org/:orgId/assignments — assign staff to a patient
export async function assignStaff(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId } = req.params;
  const { staffUserId, patientId } = req.body;

  if (!staffUserId || !patientId) return res.status(400).json({ message: "staffUserId and patientId required." });

  const membership = await getOrgMembership(userId, orgId);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ message: "Only org admins can assign staff." });
  }

  // Verify staff is an org member
  const staffMembership = await getOrgMembership(staffUserId, orgId);
  if (!staffMembership) return res.status(400).json({ message: "User is not a member of this org." });

  // Verify patient is on org roster
  const [orgPat] = await db.select().from(orgPatients)
    .where(and(eq(orgPatients.orgId, orgId), eq(orgPatients.patientId, patientId), eq(orgPatients.status, "active")));
  if (!orgPat) return res.status(400).json({ message: "Patient not on org roster." });

  const [existing] = await db.select().from(staffAssignments)
    .where(and(
      eq(staffAssignments.orgId, orgId),
      eq(staffAssignments.staffUserId, staffUserId),
      eq(staffAssignments.patientId, patientId),
    ));

  if (existing) {
    if (existing.status === "removed") {
      // Re-request requires patient approval again
      await db.update(staffAssignments).set({ status: "pending" }).where(eq(staffAssignments.id, existing.id));
      return res.json({ message: "Access re-requested. Awaiting patient approval." });
    }
    return res.status(400).json({ message: "Already assigned or pending." });
  }

  // Patient must approve before staff get data access
  const [a] = await db.insert(staffAssignments).values({ orgId, staffUserId, patientId, status: "pending" }).returning();
  res.status(201).json({ ...a, message: "Access requested. Awaiting patient approval." });
}

// DELETE /api/org/:orgId/assignments — remove a staff assignment
export async function removeAssignment(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId } = req.params;
  const { staffUserId, patientId } = req.body;

  const membership = await getOrgMembership(userId, orgId);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ message: "Only org admins can remove assignments." });
  }

  await db.update(staffAssignments).set({ status: "removed" })
    .where(and(
      eq(staffAssignments.orgId, orgId),
      eq(staffAssignments.staffUserId, staffUserId),
      eq(staffAssignments.patientId, patientId),
    ));

  res.json({ message: "Assignment removed." });
}

// DELETE /api/org/:orgId/members/:memberId — remove a staff member
export async function removeMember(req: Request, res: Response) {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { orgId, memberId } = req.params;
  const membership = await getOrgMembership(userId, orgId);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ message: "Only org admins can remove members." });
  }

  const [target] = await db.select().from(orgMembers)
    .where(and(eq(orgMembers.id, memberId), eq(orgMembers.orgId, orgId)));
  if (!target) return res.status(404).json({ message: "Member not found." });
  if (target.role === "owner" && membership.role !== "owner") {
    return res.status(403).json({ message: "Cannot remove owner." });
  }

  await db.update(orgMembers).set({ status: "removed" }).where(eq(orgMembers.id, memberId));
  res.json({ message: "Member removed." });
}

// ---------------------------------------------------------------------------
// GET /api/org/pending-assignments — pending access requests for current patient
// ---------------------------------------------------------------------------
export async function getPendingAssignments(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const rows = await db
    .select({
      assignmentId: staffAssignments.id,
      orgId: staffAssignments.orgId,
      staffUserId: staffAssignments.staffUserId,
      requestedAt: staffAssignments.createdAt,
      orgName: organizations.name,
      orgType: organizations.type,
      staffName: users.name,
      staffEmail: users.email,
    })
    .from(staffAssignments)
    .innerJoin(organizations, eq(staffAssignments.orgId, organizations.id))
    .innerJoin(users, eq(staffAssignments.staffUserId, users.id))
    .where(and(eq(staffAssignments.patientId, patientId), eq(staffAssignments.status, "pending")))
    .orderBy(desc(staffAssignments.createdAt));

  res.json(rows);
}

// ---------------------------------------------------------------------------
// POST /api/org/assignments/:assignmentId/approve — patient approves access
// ---------------------------------------------------------------------------
export async function approveAssignment(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const { assignmentId } = req.params;
  const [assignment] = await db.select().from(staffAssignments)
    .where(and(eq(staffAssignments.id, assignmentId), eq(staffAssignments.patientId, patientId), eq(staffAssignments.status, "pending")));

  if (!assignment) return res.status(404).json({ message: "Pending assignment not found." });

  // Activate assignment
  await db.update(staffAssignments).set({ status: "active" }).where(eq(staffAssignments.id, assignmentId));

  // Create care_relationship so existing canAccessPatient() grants access
  const [existing] = await db.select().from(careRelationships).where(
    and(eq(careRelationships.patientId, patientId), eq(careRelationships.caregiverId, assignment.staffUserId))
  );
  if (!existing) {
    await db.insert(careRelationships).values({
      patientId,
      caregiverId: assignment.staffUserId,
      role: "carer",
      status: "active",
    });
  } else if (existing.status === "revoked") {
    await db.update(careRelationships).set({ status: "active" }).where(eq(careRelationships.id, existing.id));
  }

  res.json({ message: "Access approved." });
}

// ---------------------------------------------------------------------------
// POST /api/org/assignments/:assignmentId/decline — patient declines access
// ---------------------------------------------------------------------------
export async function declineAssignment(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const { assignmentId } = req.params;
  const [assignment] = await db.select().from(staffAssignments)
    .where(and(eq(staffAssignments.id, assignmentId), eq(staffAssignments.patientId, patientId), eq(staffAssignments.status, "pending")));

  if (!assignment) return res.status(404).json({ message: "Pending assignment not found." });

  await db.update(staffAssignments).set({ status: "removed" }).where(eq(staffAssignments.id, assignmentId));
  res.json({ message: "Access declined." });
}

// ---------------------------------------------------------------------------
// canAccessPatientViaOrg — called from care.ts to extend access check
// ---------------------------------------------------------------------------
export async function canAccessPatientViaOrg(requesterId: string, patientId: string): Promise<boolean> {
  // Staff are assigned to patients within an org
  const [assignment] = await db
    .select()
    .from(staffAssignments)
    .where(and(
      eq(staffAssignments.staffUserId, requesterId),
      eq(staffAssignments.patientId, patientId),
      eq(staffAssignments.status, "active"),
    ));
  if (assignment) return true;

  // Org admins/owners can access all patients in their org
  const orgIds = await db
    .select({ orgId: orgMembers.orgId })
    .from(orgMembers)
    .where(and(eq(orgMembers.userId, requesterId), eq(orgMembers.status, "active")));

  if (orgIds.length === 0) return false;

  const ids = orgIds.map((o) => o.orgId);
  const [orgPat] = await db
    .select()
    .from(orgPatients)
    .innerJoin(orgMembers, and(
      eq(orgPatients.orgId, orgMembers.orgId),
      eq(orgMembers.userId, requesterId),
      eq(orgMembers.status, "active"),
      inArray(orgMembers.role, ["owner", "admin"]),
    ))
    .where(and(
      inArray(orgPatients.orgId, ids),
      eq(orgPatients.patientId, patientId),
      eq(orgPatients.status, "active"),
    ));

  return !!orgPat;
}
