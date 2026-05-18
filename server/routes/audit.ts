import type { Request, Response } from "express";
import { db } from "../db";
import { auditLogs } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";
import { canAccessPatient } from "./care";

function requireAuth(req: Request, res: Response): string | null {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ message: "Unauthorized." }); return null; }
  try { return verifyToken(token).id; }
  catch { res.status(401).json({ message: "Invalid or expired token." }); return null; }
}

// ---------------------------------------------------------------------------
// Shared helper — called from other route handlers to append audit events.
// Silent failure: never throws, so a logging error never breaks the request.
// ---------------------------------------------------------------------------
export async function addAuditLog(opts: {
  patientId: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values(opts);
  } catch {
    // intentionally silent
  }
}

// ---------------------------------------------------------------------------
// GET /api/audit/:patientId
// ---------------------------------------------------------------------------
export async function getAuditLog(req: Request, res: Response) {
  const requesterId = requireAuth(req, res);
  if (!requesterId) return;

  const { patientId } = req.params;
  if (!await canAccessPatient(requesterId, patientId)) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const rows = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.patientId, patientId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  res.json(rows);
}
