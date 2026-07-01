import type { Request, Response } from "express";
import { db } from "../db";
import { fesRtilinkConfig, fesSessions } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
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

// ---------------------------------------------------------------------------
// RTILink helpers
// ---------------------------------------------------------------------------

async function rtilinkLogin(username: string, pin: string): Promise<string | null> {
  const params = new URLSearchParams({
    "j_username": username,
    "j_password": pin,
    "closeOtherSession": "true",
  });
  const resp = await fetch("https://www.rtilink.com/datalink/j_spring_security_check", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    redirect: "manual",
  });
  const setCookie = resp.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/JSESSIONID=[^;]+/);
  return match ? match[0] : null;
}

async function rtilinkFetchCsv(sessionCookie: string, therapyId: string): Promise<string> {
  const resp = await fetch(
    `https://www.rtilink.com/datalink/app/patient-sessions-export?id=${therapyId}`,
    { headers: { Cookie: sessionCookie } },
  );
  return resp.text();
}

// Parse RTILink CSV row into DB values
function parseDate(raw: string): Date | null {
  // Format: 2025-04-21_11-21-30
  const fixed = raw.replace("_", "T").replace(/-(\d{2})-(\d{2})$/, ":$1:$2");
  const d = new Date(fixed);
  return isNaN(d.getTime()) ? null : d;
}

function parseNum(val: string): number | null {
  if (!val || val.trim() === "N/A" || val.trim() === "") return null;
  // strip units like " miles", " kcal", etc.
  const n = parseFloat(val.replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
}

function parseSeconds(val: string): number | null {
  if (!val || val.trim() === "N/A" || val.trim() === "") return null;
  // Could be raw seconds integer or "H:MM:SS" string
  if (val.includes(":")) {
    const parts = val.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

interface CsvRow {
  sessionDate: Date;
  distanceMiles: number | null;
  energyKcal: number | null;
  energyPerHour: number | null;
  avgPowerWatts: number | null;
  avgPowerActiveWatts: number | null;
  maxPowerActiveWatts: number | null;
  avgCrankVelocity: number | null;
  avgResistance: number | null;
  avgResistanceActive: number | null;
  avgStimulationUc: number | null;
  avgSymmetryPct: number | null;
  timeOffMotorSupportS: number | null;
  sessionDurationS: number | null;
  metMinutes: number | null;
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  // Skip header row
  return lines.slice(1).map(line => {
    const cols = line.split(",");
    // Columns (0-indexed):
    // 0: Session Date/Time
    // 1: Distance Travelled (miles)
    // 2: Expended Energy (Calories)
    // 3: Energy Per Hour (Calories)
    // 4: Average Power (Watts)
    // 5: Average Power - Active Forwards (Watts)
    // 6: Max Average Power - Active Forwards (Watts)
    // 7: Peak Pulse
    // 8: Average Pulse
    // 9: Average Pulse - Active Forwards
    // 10: Average Saturation - Active Forwards
    // 11: Average Crank Velocity - Active Forwards
    // 12: Average Resistance
    // 13: Average Resistance - Active Forwards
    // 14: Average Stimulation (microCoulombs)
    // 15: Average Symmetry (%)
    // 16-19: Warm-up/cool-down deviations
    // 20: MET Minutes
    // 21: Session Duration (HH:MM:SS)
    // 22: Session Duration (s)
    // 23: Time Off Motor Support (s)
    const sessionDate = parseDate(cols[0]?.trim() ?? "");
    if (!sessionDate) return null;
    return {
      sessionDate,
      distanceMiles: parseNum(cols[1] ?? ""),
      energyKcal: parseNum(cols[2] ?? ""),
      energyPerHour: parseNum(cols[3] ?? ""),
      avgPowerWatts: parseNum(cols[4] ?? ""),
      avgPowerActiveWatts: parseNum(cols[5] ?? ""),
      maxPowerActiveWatts: parseNum(cols[6] ?? ""),
      avgCrankVelocity: parseNum(cols[11] ?? ""),
      avgResistance: parseNum(cols[12] ?? ""),
      avgResistanceActive: parseNum(cols[13] ?? ""),
      avgStimulationUc: parseNum(cols[14] ?? ""),
      avgSymmetryPct: parseNum(cols[15] ?? ""),
      metMinutes: parseNum(cols[20] ?? ""),
      sessionDurationS: parseSeconds(cols[22] ?? ""),
      timeOffMotorSupportS: parseSeconds(cols[23] ?? ""),
    } as CsvRow;
  }).filter((r): r is CsvRow => r !== null);
}

async function importTherapy(
  patientId: string,
  therapyType: string,
  sessionCookie: string,
  therapyId: string,
): Promise<number> {
  const csv = await rtilinkFetchCsv(sessionCookie, therapyId);
  const rows = parseCsv(csv);
  if (rows.length === 0) return 0;

  let inserted = 0;
  for (const row of rows) {
    try {
      await db.insert(fesSessions).values({
        patientId,
        therapyType,
        ...row,
      }).onConflictDoNothing();
      inserted++;
    } catch {
      // skip duplicate
    }
  }
  return inserted;
}

// ---------------------------------------------------------------------------
// Discover therapy IDs for a logged-in RTILink session
// ---------------------------------------------------------------------------

async function discoverTherapyIds(sessionCookie: string): Promise<{
  upperLegId: string | null;
  lowerLegId: string | null;
  armsId: string | null;
}> {
  const resp = await fetch("https://www.rtilink.com/datalink/app/patient-therapies", {
    headers: { Cookie: sessionCookie },
  });
  const html = await resp.text();

  // Extract therapy IDs from named-therapy/view?id=XXXXX links
  const matches = [...html.matchAll(/named-therapy\/view\?id=(\d+)[^>]*>([^<]+)</g)];
  let upperLegId: string | null = null;
  let lowerLegId: string | null = null;
  let armsId: string | null = null;

  for (const m of matches) {
    const id = m[1];
    const name = m[2].toLowerCase();
    if (name.includes("upper leg") || name.includes("upper_leg")) upperLegId = id;
    else if (name.includes("lower leg") || name.includes("lower_leg")) lowerLegId = id;
    else if (name.includes("arm")) armsId = id;
  }

  return { upperLegId, lowerLegId, armsId };
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

export async function connectRtilink(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const { username, pin } = req.body;
  if (!username || !pin) return res.status(400).json({ message: "username and pin required." });

  const sessionCookie = await rtilinkLogin(username, pin);
  if (!sessionCookie) return res.status(401).json({ message: "RTILink login failed. Check credentials." });

  const { upperLegId, lowerLegId, armsId } = await discoverTherapyIds(sessionCookie);

  await db.insert(fesRtilinkConfig).values({
    patientId,
    rtilinkUsername: username,
    rtilinkPin: pin,
    upperLegTherapyId: upperLegId,
    lowerLegTherapyId: lowerLegId,
    armsTherapyId: armsId,
  }).onConflictDoUpdate({
    target: fesRtilinkConfig.patientId,
    set: {
      rtilinkUsername: username,
      rtilinkPin: pin,
      upperLegTherapyId: upperLegId,
      lowerLegTherapyId: lowerLegId,
      armsTherapyId: armsId,
    },
  });

  res.json({ ok: true, upperLegId, lowerLegId, armsId });
}

export async function syncRtilink(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const [config] = await db
    .select()
    .from(fesRtilinkConfig)
    .where(eq(fesRtilinkConfig.patientId, patientId));

  if (!config) return res.status(404).json({ message: "No RTILink account connected." });

  const sessionCookie = await rtilinkLogin(config.rtilinkUsername, config.rtilinkPin);
  if (!sessionCookie) return res.status(502).json({ message: "RTILink login failed." });

  let total = 0;
  if (config.upperLegTherapyId) total += await importTherapy(patientId, "upper_leg", sessionCookie, config.upperLegTherapyId);
  if (config.lowerLegTherapyId) total += await importTherapy(patientId, "lower_leg", sessionCookie, config.lowerLegTherapyId);
  if (config.armsTherapyId) total += await importTherapy(patientId, "arms", sessionCookie, config.armsTherapyId);

  await db.update(fesRtilinkConfig)
    .set({ lastSyncedAt: new Date() })
    .where(eq(fesRtilinkConfig.patientId, patientId));

  res.json({ ok: true, sessionsImported: total });
}

export async function getFesConfig(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const [config] = await db
    .select({
      lastSyncedAt: fesRtilinkConfig.lastSyncedAt,
      upperLegTherapyId: fesRtilinkConfig.upperLegTherapyId,
      lowerLegTherapyId: fesRtilinkConfig.lowerLegTherapyId,
      armsTherapyId: fesRtilinkConfig.armsTherapyId,
    })
    .from(fesRtilinkConfig)
    .where(eq(fesRtilinkConfig.patientId, patientId));

  res.json(config ?? null);
}

export async function getFesSessions(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  const therapyType = req.query.therapyType as string | undefined;

  const conditions = therapyType
    ? and(eq(fesSessions.patientId, patientId), eq(fesSessions.therapyType, therapyType))
    : eq(fesSessions.patientId, patientId);

  const rows = await db
    .select()
    .from(fesSessions)
    .where(conditions)
    .orderBy(desc(fesSessions.sessionDate))
    .limit(500);

  res.json(rows);
}

export async function disconnectRtilink(req: Request, res: Response) {
  const patientId = requireAuth(req, res);
  if (!patientId) return;

  await db.delete(fesRtilinkConfig).where(eq(fesRtilinkConfig.patientId, patientId));
  res.json({ ok: true });
}
