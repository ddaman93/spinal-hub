import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export type PdfVital = { type: string; value: string; systolic?: number | null; diastolic?: number | null; createdAt: string; authorName?: string };
export type PdfWound = { id: string; location: string; stage: string; status: string; createdAt: string; checks?: PdfCheck[] };
export type PdfCheck = { assessorName: string; stage: string; lengthCm?: number | null; widthCm?: number | null; depthCm?: number | null; notes?: string | null; photoUrl?: string | null; createdAt: string };
export type PdfMed = { name: string; dosage: string; frequency: string; times: string; scheduleType: string; route: string; notes?: string | null };
export type PdfNote = { authorName: string; noteType: string; shiftType?: string | null; content?: string; situation?: string | null; background?: string | null; assessment?: string | null; recommendation?: string | null; createdAt: string };
export type PdfProfile = { aboutMe?: string | null; injuryLevel?: string | null; injuryType?: string | null; injuryDate?: string | null; rehabCentre?: string | null; medications?: string | null; allergies?: string | null; emergencyContactName?: string | null; emergencyContactPhone?: string | null };

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NZ", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function vitalLabel(type: string) {
  return { blood_pressure: "Blood Pressure", heart_rate: "Heart Rate", oxygen: "SpO₂", temperature: "Temperature", weight: "Weight" }[type] ?? type;
}

function vitalValue(v: PdfVital) {
  if (v.type === "blood_pressure") return `${v.systolic ?? "–"}/${v.diastolic ?? "–"} mmHg`;
  const units: Record<string, string> = { heart_rate: " bpm", oxygen: "%", temperature: "°C", weight: " kg" };
  return `${v.value}${units[v.type] ?? ""}`;
}

function shiftLabel(s: string | null | undefined) {
  return ({ morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Night" })[s ?? ""] ?? "";
}

// ---------------------------------------------------------------------------
// HTML template
// ---------------------------------------------------------------------------

export function buildPatientReportHtml(opts: {
  patientName: string;
  profile: PdfProfile | null;
  vitals: PdfVital[];
  wounds: PdfWound[];
  meds: PdfMed[];
  notes: PdfNote[];
  generatedBy: string;
}): string {
  const { patientName, profile, vitals, wounds, meds, notes, generatedBy } = opts;
  const generatedAt = fmtDateTime(new Date().toISOString());

  // Latest reading per vital type
  const latestVitals: Record<string, PdfVital> = {};
  for (const v of vitals) { if (!latestVitals[v.type]) latestVitals[v.type] = v; }

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #1a1a2e; background: #fff; padding: 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; }
    h2 { font-size: 14px; font-weight: 700; color: #fff; background: #4A90D9; padding: 6px 12px; border-radius: 4px; margin: 24px 0 10px; }
    h3 { font-size: 12px; font-weight: 700; color: #4A90D9; margin: 12px 0 4px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th { text-align: left; font-size: 10px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 4px 8px; }
    td { padding: 6px 8px; font-size: 11px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #4A90D9; padding-bottom: 16px; margin-bottom: 8px; }
    .meta { font-size: 10px; color: #6b7280; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .badge-critical { background: #fee2e2; color: #dc2626; }
    .badge-warning  { background: #fef3c7; color: #d97706; }
    .badge-ok       { background: #d1fae5; color: #059669; }
    .isbar-label { font-size: 10px; font-weight: 700; color: #fff; padding: 2px 7px; border-radius: 10px; display: inline-block; margin-right: 4px; }
    .isbar-s { background: #ef4444; } .isbar-b { background: #f97316; }
    .isbar-a { background: #8B5CF6; } .isbar-r { background: #22c55e; }
    .photo { width: 120px; height: 90px; object-fit: cover; border-radius: 6px; margin-top: 6px; }
    .footer { margin-top: 32px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center; }
    p { margin-bottom: 4px; line-height: 1.5; }
  `;

  // ── Profile section ──
  const profileHtml = profile ? `
    <h2>Patient Information</h2>
    <table>
      ${profile.injuryLevel ? `<tr><th>Injury Level</th><td>${profile.injuryLevel}${profile.injuryType ? ` — ${profile.injuryType}` : ""}</td></tr>` : ""}
      ${profile.injuryDate ? `<tr><th>Injury Date</th><td>${profile.injuryDate}</td></tr>` : ""}
      ${profile.rehabCentre ? `<tr><th>Rehab Centre</th><td>${profile.rehabCentre}</td></tr>` : ""}
      ${profile.allergies ? `<tr><th>Allergies</th><td style="color:#dc2626;font-weight:600">${profile.allergies}</td></tr>` : ""}
      ${profile.emergencyContactName ? `<tr><th>Emergency Contact</th><td>${profile.emergencyContactName}${profile.emergencyContactPhone ? ` · ${profile.emergencyContactPhone}` : ""}</td></tr>` : ""}
      ${profile.aboutMe ? `<tr><th>About</th><td>${profile.aboutMe}</td></tr>` : ""}
    </table>
  ` : "";

  // ── Vitals section ──
  const vitalTypes = ["blood_pressure", "heart_rate", "oxygen", "temperature", "weight"];
  const vitalsRows = vitalTypes
    .filter((t) => latestVitals[t])
    .map((t) => {
      const v = latestVitals[t];
      return `<tr>
        <td>${vitalLabel(t)}</td>
        <td style="font-weight:600">${vitalValue(v)}</td>
        <td>${fmtDate(v.createdAt)}</td>
        <td>${v.authorName ?? ""}</td>
      </tr>`;
    }).join("");

  const vitalsHtml = vitalsRows ? `
    <h2>Recent Vitals</h2>
    <table>
      <tr><th>Measurement</th><th>Value</th><th>Date</th><th>Recorded By</th></tr>
      ${vitalsRows}
    </table>
  ` : "";

  // ── Medications section ──
  const medsRows = meds.map((m) => `
    <tr>
      <td style="font-weight:600">${m.name}</td>
      <td>${m.dosage}</td>
      <td>${m.route ?? "oral"}</td>
      <td>${m.scheduleType === "prn" ? "PRN" : m.times ?? m.frequency}</td>
      ${m.notes ? `<td>${m.notes}</td>` : "<td>—</td>"}
    </tr>
  `).join("");

  const medsHtml = medsRows ? `
    <h2>Current Medications</h2>
    <table>
      <tr><th>Name</th><th>Dosage</th><th>Route</th><th>Schedule</th><th>Notes</th></tr>
      ${medsRows}
    </table>
  ` : "";

  // ── Wounds section ──
  const woundsHtml = wounds.length === 0 ? "" : `
    <h2>Pressure Injuries</h2>
    ${wounds.map((w) => {
      const lastCheck = w.checks?.[0];
      const stageBadge = ["III", "IV", "Unstageable", "DTI"].includes(w.stage)
        ? `<span class="badge badge-critical">Stage ${w.stage}</span>`
        : `<span class="badge badge-ok">Stage ${w.stage}</span>`;
      const photoHtml = lastCheck?.photoUrl ? `<br/><img class="photo" src="${lastCheck.photoUrl}" />` : "";
      return `
        <h3>${w.location} ${stageBadge} <span style="font-weight:400;color:#6b7280;font-size:10px">— ${w.status}</span></h3>
        ${lastCheck ? `
        <table>
          <tr><th>Last Assessed</th><td>${fmtDate(lastCheck.createdAt)}</td><th>Assessor</th><td>${lastCheck.assessorName}</td></tr>
          ${lastCheck.lengthCm ? `<tr><th>Dimensions</th><td>${lastCheck.lengthCm} × ${lastCheck.widthCm ?? "–"} × ${lastCheck.depthCm ?? "–"} cm</td></tr>` : ""}
          ${lastCheck.notes ? `<tr><th>Notes</th><td>${lastCheck.notes}</td></tr>` : ""}
        </table>
        ${photoHtml}
        ` : "<p style='color:#6b7280;font-size:10px'>No assessments recorded yet.</p>"}
      `;
    }).join("")}
  `;

  // ── Handover notes ──
  const notesHtml = notes.length === 0 ? "" : `
    <h2>Recent Handover Notes</h2>
    ${notes.slice(0, 10).map((n) => {
      const shift = shiftLabel(n.shiftType);
      const header = `<p style="font-size:10px;color:#6b7280;margin-bottom:4px">${fmtDateTime(n.createdAt)} · <strong>${n.authorName}</strong>${shift ? ` · ${shift} shift` : ""}</p>`;
      if (n.noteType === "isbar") {
        return `<div style="border-left:3px solid #4A90D9;padding-left:10px;margin-bottom:12px">
          ${header}
          ${n.situation ? `<p><span class="isbar-label isbar-s">S</span>${n.situation}</p>` : ""}
          ${n.background ? `<p><span class="isbar-label isbar-b">B</span>${n.background}</p>` : ""}
          ${n.assessment ? `<p><span class="isbar-label isbar-a">A</span>${n.assessment}</p>` : ""}
          ${n.recommendation ? `<p><span class="isbar-label isbar-r">R</span>${n.recommendation}</p>` : ""}
        </div>`;
      }
      return `<div style="border-left:3px solid #e5e7eb;padding-left:10px;margin-bottom:12px">
        ${header}<p>${n.content ?? ""}</p>
      </div>`;
    }).join("")}
  `;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>${css}</style></head>
<body>
  <div class="header">
    <div>
      <h1>${patientName}</h1>
      <div class="meta">Patient Clinical Report · Generated ${generatedAt}</div>
    </div>
    <div style="text-align:right">
      <div class="meta">Generated by: <strong>${generatedBy}</strong></div>
      <div class="meta">Spinal Hub</div>
    </div>
  </div>
  ${profileHtml}
  ${vitalsHtml}
  ${medsHtml}
  ${woundsHtml}
  ${notesHtml}
  <div class="footer">Confidential clinical record — Spinal Hub · Generated ${generatedAt}</div>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Export entry point
// ---------------------------------------------------------------------------

export async function exportPatientPdf(opts: Parameters<typeof buildPatientReportHtml>[0] & { patientName: string }) {
  const html = buildPatientReportHtml(opts);
  const safe = opts.patientName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStr = new Date().toISOString().slice(0, 10);

  let uri: string;
  try {
    const result = await Print.printToFileAsync({ html, base64: false });
    uri = result.uri;
  } catch {
    Alert.alert("Export failed", "Could not generate PDF. Please try again.");
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${opts.patientName} Clinical Report`,
      UTI: "com.adobe.pdf",
    });
  } else {
    Alert.alert("PDF saved", `Report saved to: ${uri}`);
  }
}
