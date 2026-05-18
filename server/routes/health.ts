import type { Request, Response } from "express";
import { db } from "../db";
import {
  vitals, medications, medicationLogs, appointments,
  bladderLogs, bowelLogs, painEntries, hydrationLogs,
  routineTasks, routineCompletions,
  skinCheckEntries, carePreferences,
  users,
} from "@shared/schema";
import { eq, and, desc, asc, gte } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";
import { canAccessPatient, getCarerRole } from "./care";

// Family members see schedules/preferences but not clinical records
async function requireClinicalAccess(requesterId: string, patientId: string, res: Response): Promise<boolean> {
  const role = await getCarerRole(requesterId, patientId);
  if (!role) { res.status(403).json({ message: "Access denied." }); return false; }
  if (role === "family") { res.status(403).json({ message: "Family members cannot access clinical records." }); return false; }
  return true;
}

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

async function getAuthorName(requesterId: string): Promise<string> {
  const rows = await db.select({ name: users.name }).from(users).where(eq(users.id, requesterId)).limit(1);
  return rows[0]?.name ?? "Unknown";
}

// ---------------------------------------------------------------------------
// VITALS
// ---------------------------------------------------------------------------

export async function getVitals(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await requireClinicalAccess(requesterId, patientId, res)) return;
  res.json(await db.select().from(vitals).where(eq(vitals.patientId, patientId)).orderBy(desc(vitals.createdAt)));
}

export async function addVital(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, type, value, systolic, diastolic, notes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await requireClinicalAccess(requesterId, targetPatient, res)) return;
  if (!type || !value) return res.status(400).json({ message: "type and value are required." });
  const authorName = await getAuthorName(requesterId);
  const [row] = await db.insert(vitals).values({ patientId: targetPatient, recordedById: requesterId, authorName, type, value, systolic: systolic ?? null, diastolic: diastolic ?? null, notes: notes ?? null }).returning();
  res.status(201).json(row);
}

export async function deleteVital(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(vitals).where(eq(vitals.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (row.recordedById !== requesterId && row.patientId !== requesterId && !await requireClinicalAccess(requesterId, row.patientId, res)) return;
  await db.delete(vitals).where(eq(vitals.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// MEDICATIONS
// ---------------------------------------------------------------------------

export async function getMedications(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await requireClinicalAccess(requesterId, patientId, res)) return;
  res.json(await db.select().from(medications).where(eq(medications.patientId, patientId)).orderBy(asc(medications.createdAt)));
}

export async function addMedication(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, name, dosage, frequency, times, scheduleType, route, notes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await requireClinicalAccess(requesterId, targetPatient, res)) return;
  if (!name) return res.status(400).json({ message: "name is required." });
  const [row] = await db.insert(medications).values({ patientId: targetPatient, name, dosage: dosage ?? "", frequency: frequency ?? "Daily", times: Array.isArray(times) ? times.join(", ") : (times ?? "8:00 AM"), scheduleType: scheduleType ?? "scheduled", route: route ?? "oral", notes: notes ?? null }).returning();
  res.status(201).json(row);
}

export async function updateMedication(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(medications).where(eq(medications.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (!await requireClinicalAccess(requesterId, row.patientId, res)) return;
  const { name, dosage, frequency, times, notes } = req.body;
  const [updated] = await db.update(medications).set({ name: name ?? row.name, dosage: dosage ?? row.dosage, frequency: frequency ?? row.frequency, times: times ? (Array.isArray(times) ? times.join(", ") : times) : row.times, notes: notes ?? row.notes }).where(eq(medications.id, req.params.id)).returning();
  res.json(updated);
}

export async function deleteMedication(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(medications).where(eq(medications.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (!await requireClinicalAccess(requesterId, row.patientId, res)) return;
  await db.delete(medications).where(eq(medications.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// MEDICATION LOGS
// ---------------------------------------------------------------------------

export async function getMedicationLogs(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ message: "date is required." });
  if (!await requireClinicalAccess(requesterId, patientId, res)) return;
  res.json(await db.select().from(medicationLogs).where(and(eq(medicationLogs.patientId, patientId), eq(medicationLogs.date, date))));
}

export async function upsertMedicationLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { medicationId, patientId, date, scheduledTime, taken, actualTime, reasonOmitted } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await requireClinicalAccess(requesterId, targetPatient, res)) return;
  const adminName = await getAuthorName(requesterId);
  const existing = await db.select().from(medicationLogs).where(and(eq(medicationLogs.medicationId, medicationId), eq(medicationLogs.patientId, targetPatient), eq(medicationLogs.date, date), eq(medicationLogs.scheduledTime, scheduledTime))).limit(1);
  if (existing.length > 0) {
    const [updated] = await db.update(medicationLogs).set({ taken, actualTime: actualTime ?? null, recordedById: requesterId, administeredByName: taken ? adminName : null, reasonOmitted: taken ? null : (reasonOmitted ?? null) }).where(eq(medicationLogs.id, existing[0].id)).returning();
    return res.json(updated);
  }
  const [row] = await db.insert(medicationLogs).values({ medicationId, patientId: targetPatient, recordedById: requesterId, date, scheduledTime, taken: taken ?? false, actualTime: actualTime ?? null, administeredByName: taken ? adminName : null, reasonOmitted: taken ? null : (reasonOmitted ?? null) }).returning();
  res.status(201).json(row);
}

// ---------------------------------------------------------------------------
// APPOINTMENTS
// ---------------------------------------------------------------------------

export async function getAppointments(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await canAccessPatient(requesterId, patientId)) return res.status(403).json({ message: "Access denied." });
  const today = new Date().toISOString().slice(0, 10);
  res.json(await db.select().from(appointments).where(and(eq(appointments.patientId, patientId), gte(appointments.date, today))).orderBy(asc(appointments.date), asc(appointments.time)));
}

export async function addAppointment(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, title, type, date, time, location, notes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await canAccessPatient(requesterId, targetPatient)) return res.status(403).json({ message: "Access denied." });
  if (!title || !date) return res.status(400).json({ message: "title and date are required." });
  const [row] = await db.insert(appointments).values({ patientId: targetPatient, createdById: requesterId, title, type: type ?? "other", date, time: time ?? "", location: location ?? null, notes: notes ?? null }).returning();
  res.status(201).json(row);
}

export async function updateAppointment(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(appointments).where(eq(appointments.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (!await canAccessPatient(requesterId, row.patientId)) return res.status(403).json({ message: "Access denied." });
  const { title, type, date, time, location, notes } = req.body;
  const [updated] = await db.update(appointments).set({ title: title ?? row.title, type: type ?? row.type, date: date ?? row.date, time: time ?? row.time, location: location ?? row.location, notes: notes ?? row.notes }).where(eq(appointments.id, req.params.id)).returning();
  res.json(updated);
}

export async function deleteAppointment(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(appointments).where(eq(appointments.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (!await canAccessPatient(requesterId, row.patientId)) return res.status(403).json({ message: "Access denied." });
  await db.delete(appointments).where(eq(appointments.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// BLADDER LOG
// ---------------------------------------------------------------------------

export async function getBladderLogs(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await requireClinicalAccess(requesterId, patientId, res)) return;
  res.json(await db.select().from(bladderLogs).where(eq(bladderLogs.patientId, patientId)).orderBy(desc(bladderLogs.createdAt)));
}

export async function addBladderLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, type, volumeMl, notes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await requireClinicalAccess(requesterId, targetPatient, res)) return;
  if (!type) return res.status(400).json({ message: "type is required." });
  const authorName = await getAuthorName(requesterId);
  const [row] = await db.insert(bladderLogs).values({ patientId: targetPatient, recordedById: requesterId, authorName, type, volumeMl: volumeMl ?? null, notes: notes ?? null }).returning();
  res.status(201).json(row);
}

export async function deleteBladderLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(bladderLogs).where(eq(bladderLogs.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (row.recordedById !== requesterId && row.patientId !== requesterId && !await requireClinicalAccess(requesterId, row.patientId, res)) return;
  await db.delete(bladderLogs).where(eq(bladderLogs.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// BOWEL LOG
// ---------------------------------------------------------------------------

export async function getBowelLogs(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await requireClinicalAccess(requesterId, patientId, res)) return;
  res.json(await db.select().from(bowelLogs).where(eq(bowelLogs.patientId, patientId)).orderBy(desc(bowelLogs.createdAt)));
}

export async function addBowelLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, method, bristolType, amount, colour, durationMins, notes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await requireClinicalAccess(requesterId, targetPatient, res)) return;
  if (!method) return res.status(400).json({ message: "method is required." });
  const authorName = await getAuthorName(requesterId);
  const [row] = await db.insert(bowelLogs).values({
    patientId: targetPatient,
    recordedById: requesterId,
    authorName,
    method,
    bristolType: bristolType ?? null,
    amount: amount ?? null,
    colour: colour ?? null,
    durationMins: durationMins ?? null,
    notes: notes ?? null,
  }).returning();
  res.status(201).json(row);
}

export async function deleteBowelLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(bowelLogs).where(eq(bowelLogs.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (row.recordedById !== requesterId && row.patientId !== requesterId && !await requireClinicalAccess(requesterId, row.patientId, res)) return;
  await db.delete(bowelLogs).where(eq(bowelLogs.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// PAIN JOURNAL
// ---------------------------------------------------------------------------

export async function getPainEntries(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await requireClinicalAccess(requesterId, patientId, res)) return;
  res.json(await db.select().from(painEntries).where(eq(painEntries.patientId, patientId)).orderBy(desc(painEntries.createdAt)));
}

export async function addPainEntry(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, level, location, description } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await requireClinicalAccess(requesterId, targetPatient, res)) return;
  if (level === undefined || !location) return res.status(400).json({ message: "level and location are required." });
  const authorName = await getAuthorName(requesterId);
  const [row] = await db.insert(painEntries).values({ patientId: targetPatient, recordedById: requesterId, authorName, level: Number(level), location, description: description ?? null }).returning();
  res.status(201).json(row);
}

export async function deletePainEntry(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(painEntries).where(eq(painEntries.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (row.recordedById !== requesterId && row.patientId !== requesterId && !await requireClinicalAccess(requesterId, row.patientId, res)) return;
  await db.delete(painEntries).where(eq(painEntries.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// HYDRATION
// ---------------------------------------------------------------------------

export async function getHydrationLogs(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  const date = req.query.date as string;
  if (!await canAccessPatient(requesterId, patientId)) return res.status(403).json({ message: "Access denied." });
  const rows = date
    ? await db.select().from(hydrationLogs).where(and(eq(hydrationLogs.patientId, patientId), eq(hydrationLogs.date, date))).orderBy(asc(hydrationLogs.createdAt))
    : await db.select().from(hydrationLogs).where(eq(hydrationLogs.patientId, patientId)).orderBy(desc(hydrationLogs.createdAt));
  res.json(rows);
}

export async function addHydrationLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, amount, unit, date } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await canAccessPatient(requesterId, targetPatient)) return res.status(403).json({ message: "Access denied." });
  if (!amount || !date) return res.status(400).json({ message: "amount and date are required." });
  const [row] = await db.insert(hydrationLogs).values({ patientId: targetPatient, recordedById: requesterId, amount: Number(amount), unit: unit ?? "ml", date }).returning();
  res.status(201).json(row);
}

export async function deleteHydrationLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(hydrationLogs).where(eq(hydrationLogs.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (row.recordedById !== requesterId && row.patientId !== requesterId && !await canAccessPatient(requesterId, row.patientId)) return res.status(403).json({ message: "Access denied." });
  await db.delete(hydrationLogs).where(eq(hydrationLogs.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// ROUTINE TASKS + COMPLETIONS
// ---------------------------------------------------------------------------

export async function getRoutineTasks(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  const category = req.query.category as string | undefined;
  if (!await canAccessPatient(requesterId, patientId)) return res.status(403).json({ message: "Access denied." });
  const rows = category
    ? await db.select().from(routineTasks).where(and(eq(routineTasks.patientId, patientId), eq(routineTasks.category, category))).orderBy(asc(routineTasks.orderIndex))
    : await db.select().from(routineTasks).where(eq(routineTasks.patientId, patientId)).orderBy(asc(routineTasks.orderIndex));
  res.json(rows);
}

export async function addRoutineTask(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, name, category, orderIndex } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await canAccessPatient(requesterId, targetPatient)) return res.status(403).json({ message: "Access denied." });
  if (!name) return res.status(400).json({ message: "name is required." });
  const [row] = await db.insert(routineTasks).values({ patientId: targetPatient, name, category: category ?? "morning", orderIndex: orderIndex ?? 0 }).returning();
  res.status(201).json(row);
}

export async function deleteRoutineTask(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(routineTasks).where(eq(routineTasks.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (!await canAccessPatient(requesterId, row.patientId)) return res.status(403).json({ message: "Access denied." });
  await db.delete(routineTasks).where(eq(routineTasks.id, req.params.id));
  res.json({ ok: true });
}

export async function getRoutineCompletions(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ message: "date is required." });
  if (!await canAccessPatient(requesterId, patientId)) return res.status(403).json({ message: "Access denied." });
  res.json(await db.select().from(routineCompletions).where(and(eq(routineCompletions.patientId, patientId), eq(routineCompletions.date, date))));
}

export async function toggleRoutineCompletion(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { taskId, patientId, date } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await canAccessPatient(requesterId, targetPatient)) return res.status(403).json({ message: "Access denied." });
  const existing = await db.select().from(routineCompletions).where(and(eq(routineCompletions.taskId, taskId), eq(routineCompletions.patientId, targetPatient), eq(routineCompletions.date, date))).limit(1);
  if (existing.length > 0) {
    await db.delete(routineCompletions).where(eq(routineCompletions.id, existing[0].id));
    return res.json({ completed: false });
  }
  const [row] = await db.insert(routineCompletions).values({ taskId, patientId: targetPatient, recordedById: requesterId, date, completedAt: new Date().toISOString() }).returning();
  res.status(201).json({ completed: true, ...row });
}

// ---------------------------------------------------------------------------
// SKIN CHECK LOG
// ---------------------------------------------------------------------------

export async function getSkinCheckEntries(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await canAccessPatient(requesterId, patientId)) return res.status(403).json({ message: "Access denied." });
  res.json(await db.select().from(skinCheckEntries).where(eq(skinCheckEntries.patientId, patientId)).orderBy(desc(skinCheckEntries.createdAt)));
}

export async function addSkinCheckEntry(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, location, severity, notes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await canAccessPatient(requesterId, targetPatient)) return res.status(403).json({ message: "Access denied." });
  if (!location || !severity) return res.status(400).json({ message: "location and severity are required." });
  const authorName = await getAuthorName(requesterId);
  const [row] = await db.insert(skinCheckEntries).values({ patientId: targetPatient, recordedById: requesterId, authorName, location, severity, notes: notes ?? null }).returning();
  res.status(201).json(row);
}

export async function deleteSkinCheckEntry(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const [row] = await db.select().from(skinCheckEntries).where(eq(skinCheckEntries.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });
  if (row.recordedById !== requesterId && row.patientId !== requesterId && !await canAccessPatient(requesterId, row.patientId)) return res.status(403).json({ message: "Access denied." });
  await db.delete(skinCheckEntries).where(eq(skinCheckEntries.id, req.params.id));
  res.json({ ok: true });
}

// ---------------------------------------------------------------------------
// CARE PREFERENCES  (single doc per patient)
// ---------------------------------------------------------------------------

export async function getCarePreferences(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const patientId = (req.query.patientId as string) || requesterId;
  if (!await canAccessPatient(requesterId, patientId)) return res.status(403).json({ message: "Access denied." });
  const [row] = await db.select().from(carePreferences).where(eq(carePreferences.patientId, patientId));
  res.json(row ?? null);
}

export async function upsertCarePreferences(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;
  const { patientId, name, injuryLevel, injuryType, equipment, allergies, medicationsSummary, morningCareNotes, eveningCareNotes, otherNotes } = req.body;
  const targetPatient = patientId || requesterId;
  if (!await canAccessPatient(requesterId, targetPatient)) return res.status(403).json({ message: "Access denied." });
  const values = { patientId: targetPatient, name: name ?? "", injuryLevel: injuryLevel ?? "", injuryType: injuryType ?? "", equipment: equipment ?? "", allergies: allergies ?? "", medicationsSummary: medicationsSummary ?? "", morningCareNotes: morningCareNotes ?? "", eveningCareNotes: eveningCareNotes ?? "", otherNotes: otherNotes ?? "", updatedAt: new Date() };
  const [row] = await db.insert(carePreferences).values(values).onConflictDoUpdate({ target: carePreferences.patientId, set: { ...values } }).returning();
  res.json(row);
}
