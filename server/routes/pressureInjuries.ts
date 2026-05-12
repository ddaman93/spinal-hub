import type { Request, Response } from "express";
import { db } from "../db";
import { pressureInjuries, pressureInjuryChecks, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";
import { canAccessPatient } from "./care";

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

// GET /api/pressure-injuries?patientId=
export async function getInjuries(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const patientId = (req.query.patientId as string) || requesterId;

  if (!await canAccessPatient(requesterId, patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const injuries = await db.select().from(pressureInjuries)
    .where(eq(pressureInjuries.patientId, patientId))
    .orderBy(desc(pressureInjuries.updatedAt));

  res.json(injuries);
}

// POST /api/pressure-injuries
export async function createInjury(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId, site, siteLabel } = req.body;
  const targetPatient = patientId || requesterId;

  if (!await canAccessPatient(requesterId, targetPatient)) {
    return res.status(403).json({ message: "Access denied." });
  }

  if (!site) return res.status(400).json({ message: "site is required." });

  const [injury] = await db.insert(pressureInjuries).values({
    patientId: targetPatient,
    site,
    siteLabel: siteLabel || null,
  }).returning();

  res.status(201).json(injury);
}

// PATCH /api/pressure-injuries/:id — update status (healed/active)
export async function updateInjury(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { id } = req.params;
  const [injury] = await db.select().from(pressureInjuries).where(eq(pressureInjuries.id, id));
  if (!injury) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, injury.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { status } = req.body;
  const [updated] = await db.update(pressureInjuries)
    .set({ status, updatedAt: new Date() })
    .where(eq(pressureInjuries.id, id))
    .returning();

  res.json(updated);
}

// DELETE /api/pressure-injuries/:id
export async function deleteInjury(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { id } = req.params;
  const [injury] = await db.select().from(pressureInjuries).where(eq(pressureInjuries.id, id));
  if (!injury) return res.status(404).json({ message: "Not found." });

  // Only the patient can delete their own wound record
  if (injury.patientId !== requesterId) {
    return res.status(403).json({ message: "Only the patient can delete a wound record." });
  }

  await db.delete(pressureInjuries).where(eq(pressureInjuries.id, id));
  res.json({ message: "Deleted." });
}

// GET /api/pressure-injuries/:id/checks
export async function getChecks(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { id } = req.params;
  const [injury] = await db.select().from(pressureInjuries).where(eq(pressureInjuries.id, id));
  if (!injury) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, injury.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const checks = await db.select({
    id: pressureInjuryChecks.id,
    injuryId: pressureInjuryChecks.injuryId,
    stage: pressureInjuryChecks.stage,
    lengthCm: pressureInjuryChecks.lengthCm,
    widthCm: pressureInjuryChecks.widthCm,
    depthCm: pressureInjuryChecks.depthCm,
    woundBed: pressureInjuryChecks.woundBed,
    exudate: pressureInjuryChecks.exudate,
    surroundingSkin: pressureInjuryChecks.surroundingSkin,
    odor: pressureInjuryChecks.odor,
    painScore: pressureInjuryChecks.painScore,
    photoUrl: pressureInjuryChecks.photoUrl,
    notes: pressureInjuryChecks.notes,
    createdAt: pressureInjuryChecks.createdAt,
    assessedBy: { id: users.id, name: users.name },
  }).from(pressureInjuryChecks)
    .innerJoin(users, eq(pressureInjuryChecks.assessedById, users.id))
    .where(eq(pressureInjuryChecks.injuryId, id))
    .orderBy(desc(pressureInjuryChecks.createdAt));

  res.json(checks);
}

// POST /api/pressure-injuries/:id/checks
export async function addCheck(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { id } = req.params;
  const [injury] = await db.select().from(pressureInjuries).where(eq(pressureInjuries.id, id));
  if (!injury) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, injury.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const {
    stage, lengthCm, widthCm, depthCm,
    woundBed, exudate, surroundingSkin,
    odor, painScore, photoUrl, notes,
  } = req.body;

  if (!stage) return res.status(400).json({ message: "stage is required." });

  const [check] = await db.insert(pressureInjuryChecks).values({
    injuryId: id,
    assessedById: requesterId,
    stage,
    lengthCm: lengthCm ?? null,
    widthCm: widthCm ?? null,
    depthCm: depthCm ?? null,
    woundBed: woundBed || null,
    exudate: exudate || null,
    surroundingSkin: surroundingSkin || null,
    odor: odor ?? false,
    painScore: painScore ?? null,
    photoUrl: photoUrl || null,
    notes: notes || null,
  }).returning();

  // Update the wound's updatedAt
  await db.update(pressureInjuries)
    .set({ updatedAt: new Date() })
    .where(eq(pressureInjuries.id, id));

  res.status(201).json(check);
}
