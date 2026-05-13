import type { Request, Response } from "express";
import { db } from "../db";
import { vitals, medications, medicationLogs, appointments, users } from "@shared/schema";
import { eq, and, desc, asc, gte } from "drizzle-orm";
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
  if (!await canAccessPatient(requesterId, patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const rows = await db.select().from(vitals)
    .where(eq(vitals.patientId, patientId))
    .orderBy(desc(vitals.createdAt));

  res.json(rows);
}

export async function addVital(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId, type, value, systolic, diastolic, notes } = req.body;
  const targetPatient = patientId || requesterId;

  if (!await canAccessPatient(requesterId, targetPatient)) {
    return res.status(403).json({ message: "Access denied." });
  }
  if (!type || !value) return res.status(400).json({ message: "type and value are required." });

  const authorName = await getAuthorName(requesterId);
  const [row] = await db.insert(vitals).values({
    patientId: targetPatient,
    recordedById: requesterId,
    authorName,
    type,
    value,
    systolic: systolic ?? null,
    diastolic: diastolic ?? null,
    notes: notes ?? null,
  }).returning();

  res.status(201).json(row);
}

export async function deleteVital(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const [row] = await db.select().from(vitals).where(eq(vitals.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });

  if (row.recordedById !== requesterId && row.patientId !== requesterId) {
    if (!await canAccessPatient(requesterId, row.patientId)) {
      return res.status(403).json({ message: "Access denied." });
    }
  }

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
  if (!await canAccessPatient(requesterId, patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const rows = await db.select().from(medications)
    .where(eq(medications.patientId, patientId))
    .orderBy(asc(medications.createdAt));

  res.json(rows);
}

export async function addMedication(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId, name, dosage, frequency, times, notes } = req.body;
  const targetPatient = patientId || requesterId;

  if (!await canAccessPatient(requesterId, targetPatient)) {
    return res.status(403).json({ message: "Access denied." });
  }
  if (!name) return res.status(400).json({ message: "name is required." });

  const [row] = await db.insert(medications).values({
    patientId: targetPatient,
    name,
    dosage: dosage ?? "",
    frequency: frequency ?? "Daily",
    times: Array.isArray(times) ? times.join(", ") : (times ?? "8:00 AM"),
    notes: notes ?? null,
  }).returning();

  res.status(201).json(row);
}

export async function updateMedication(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const [row] = await db.select().from(medications).where(eq(medications.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, row.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { name, dosage, frequency, times, notes } = req.body;
  const [updated] = await db.update(medications)
    .set({
      name: name ?? row.name,
      dosage: dosage ?? row.dosage,
      frequency: frequency ?? row.frequency,
      times: times ? (Array.isArray(times) ? times.join(", ") : times) : row.times,
      notes: notes ?? row.notes,
    })
    .where(eq(medications.id, req.params.id))
    .returning();

  res.json(updated);
}

export async function deleteMedication(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const [row] = await db.select().from(medications).where(eq(medications.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, row.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

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

  if (!await canAccessPatient(requesterId, patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const rows = await db.select().from(medicationLogs)
    .where(and(eq(medicationLogs.patientId, patientId), eq(medicationLogs.date, date)));

  res.json(rows);
}

export async function upsertMedicationLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { medicationId, patientId, date, scheduledTime, taken, actualTime } = req.body;
  const targetPatient = patientId || requesterId;

  if (!await canAccessPatient(requesterId, targetPatient)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const existing = await db.select().from(medicationLogs).where(
    and(
      eq(medicationLogs.medicationId, medicationId),
      eq(medicationLogs.patientId, targetPatient),
      eq(medicationLogs.date, date),
      eq(medicationLogs.scheduledTime, scheduledTime),
    )
  ).limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(medicationLogs)
      .set({ taken, actualTime: actualTime ?? null, recordedById: requesterId })
      .where(eq(medicationLogs.id, existing[0].id))
      .returning();
    return res.json(updated);
  }

  const [row] = await db.insert(medicationLogs).values({
    medicationId,
    patientId: targetPatient,
    recordedById: requesterId,
    date,
    scheduledTime,
    taken: taken ?? false,
    actualTime: actualTime ?? null,
  }).returning();

  res.status(201).json(row);
}

// ---------------------------------------------------------------------------
// APPOINTMENTS
// ---------------------------------------------------------------------------

export async function getAppointments(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const patientId = (req.query.patientId as string) || requesterId;
  if (!await canAccessPatient(requesterId, patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const today = new Date().toISOString().slice(0, 10);
  const rows = await db.select().from(appointments)
    .where(and(eq(appointments.patientId, patientId), gte(appointments.date, today)))
    .orderBy(asc(appointments.date), asc(appointments.time));

  res.json(rows);
}

export async function addAppointment(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId, title, type, date, time, location, notes } = req.body;
  const targetPatient = patientId || requesterId;

  if (!await canAccessPatient(requesterId, targetPatient)) {
    return res.status(403).json({ message: "Access denied." });
  }
  if (!title || !date) return res.status(400).json({ message: "title and date are required." });

  const [row] = await db.insert(appointments).values({
    patientId: targetPatient,
    createdById: requesterId,
    title,
    type: type ?? "other",
    date,
    time: time ?? "",
    location: location ?? null,
    notes: notes ?? null,
  }).returning();

  res.status(201).json(row);
}

export async function updateAppointment(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const [row] = await db.select().from(appointments).where(eq(appointments.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, row.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { title, type, date, time, location, notes } = req.body;
  const [updated] = await db.update(appointments)
    .set({
      title: title ?? row.title,
      type: type ?? row.type,
      date: date ?? row.date,
      time: time ?? row.time,
      location: location ?? row.location,
      notes: notes ?? row.notes,
    })
    .where(eq(appointments.id, req.params.id))
    .returning();

  res.json(updated);
}

export async function deleteAppointment(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const [row] = await db.select().from(appointments).where(eq(appointments.id, req.params.id));
  if (!row) return res.status(404).json({ message: "Not found." });

  if (!await canAccessPatient(requesterId, row.patientId)) {
    return res.status(403).json({ message: "Access denied." });
  }

  await db.delete(appointments).where(eq(appointments.id, req.params.id));
  res.json({ ok: true });
}
