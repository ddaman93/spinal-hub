import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert,
  Dimensions,
} from "react-native";

const TILE_WIDTH = (Dimensions.get("window").width - 48 - 16) / 3; // 3 cols, 24px padding each side, 8px * 2 gaps
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { CARE_TILES, CareTile } from "@/data/careTiles";
import { exportPatientPdf } from "@/lib/exportPdf";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, "PatientDetail">;

type Tile = CareTile;

type Profile = {
  aboutMe?: string | null;
  injuryLevel?: string | null;
  injuryType?: string | null;
  injuryDate?: string | null;
  rehabCentre?: string | null;
  routineHighlights?: string | null;
  medicalNotes?: string | null;
  caregiverNotes?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medications?: string | null;
  allergies?: string | null;
};

type EscalationAlert = {
  severity: "critical" | "warning";
  message: string;
  icon: string;
};

function computeAlerts(vitals: any[], wounds: any[], meds: any[], logs: any[]): EscalationAlert[] {
  const out: EscalationAlert[] = [];

  // Vitals — use latest reading per type
  const byType: Record<string, any> = {};
  for (const v of vitals) { if (!byType[v.type]) byType[v.type] = v; }

  const bp = byType["blood_pressure"];
  if (bp?.systolic) {
    const s = bp.systolic;
    if (s < 90 || s > 180) out.push({ severity: "critical", message: `BP ${s}/${bp.diastolic} — outside safe range`, icon: "activity" });
    else if (s < 110 || s > 150) out.push({ severity: "warning", message: `BP ${s}/${bp.diastolic} — borderline`, icon: "activity" });
  }
  const hr = byType["heart_rate"];
  if (hr) {
    const v = parseFloat(hr.value);
    if (v < 40 || v > 130) out.push({ severity: "critical", message: `HR ${v} bpm — outside safe range`, icon: "activity" });
    else if (v < 50 || v > 110) out.push({ severity: "warning", message: `HR ${v} bpm — borderline`, icon: "activity" });
  }
  const o2 = byType["oxygen"];
  if (o2) {
    const v = parseFloat(o2.value);
    if (v < 90) out.push({ severity: "critical", message: `SpO₂ ${v}% — critically low`, icon: "activity" });
    else if (v < 95) out.push({ severity: "warning", message: `SpO₂ ${v}% — below normal`, icon: "activity" });
  }
  const temp = byType["temperature"];
  if (temp) {
    const v = parseFloat(temp.value);
    if (v < 35 || v > 39.5) out.push({ severity: "critical", message: `Temp ${v}°C — outside safe range`, icon: "thermometer" });
    else if (v < 36 || v > 38.5) out.push({ severity: "warning", message: `Temp ${v}°C — borderline`, icon: "thermometer" });
  }

  // Wounds — active stage III+ trigger alert
  for (const w of wounds) {
    if (w.status !== "active") continue;
    if (["III", "IV", "Unstageable", "DTI"].includes(w.stage)) {
      out.push({ severity: "critical", message: `${w.location || "Wound"}: Stage ${w.stage} pressure injury`, icon: "shield" });
    }
  }

  // Missed meds — scheduled dose past 2hr window with no taken=true log
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (const med of meds) {
    if (med.scheduleType !== "scheduled") continue;
    const slots: string[] = (med.times as string || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    for (const slot of slots) {
      const match = slot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!match) continue;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      if (nowMins - (h * 60 + m) < 120) continue;
      const log = logs.find((l: any) => l.medicationId === med.id && l.scheduledTime === slot);
      if (!log || !log.taken) {
        out.push({ severity: "warning", message: `${med.name} — ${slot} dose not recorded`, icon: "package" });
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function PatientDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<EscalationAlert[]>([]);
  const [rawVitals, setRawVitals] = useState<any[]>([]);
  const [rawWounds, setRawWounds] = useState<any[]>([]);
  const [rawMeds, setRawMeds] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const pid = encodeURIComponent(params.patientId);
      const today = new Date().toISOString().slice(0, 10);
      const headers = { Authorization: `Bearer ${token}` };
      const api = getApiUrl();

      const [profileRes, vitalsRes, woundsRes, medsRes] = await Promise.all([
        fetch(`${api}/api/care/profile/${pid}`, { headers }),
        fetch(`${api}/api/health/vitals?patientId=${pid}`, { headers }),
        fetch(`${api}/api/pressure-injuries?patientId=${pid}`, { headers }),
        fetch(`${api}/api/health/medications?patientId=${pid}`, { headers }),
      ]);

      if (profileRes.ok) setProfile(await profileRes.json());

      const vitalsData = vitalsRes.ok ? await vitalsRes.json() : [];
      const woundsData = woundsRes.ok ? await woundsRes.json() : [];
      const medsData = medsRes.ok ? await medsRes.json() : [];

      setRawVitals(vitalsData);
      setRawWounds(woundsData);
      setRawMeds(medsData);

      let logsData: any[] = [];
      if (medsData.length > 0) {
        const logsRes = await fetch(`${api}/api/health/medication-logs?patientId=${pid}&date=${today}`, { headers });
        if (logsRes.ok) logsData = await logsRes.json();
      }

      setAlerts(computeAlerts(vitalsData, woundsData, medsData, logsData));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const PATIENT_SCREENS = ["VitalsLog", "MedicationTracker", "AppointmentScheduler", "BladderLog", "BowelLog", "PainJournal", "HydrationTracker", "MorningRoutine", "EveningRoutine", "SkinCheckLog", "CarePreferences", "RehabGoals"];

  function handleTilePress(tile: Tile) {
    if (!tile.screen) {
      Alert.alert("Coming Soon", `${tile.label} will be available in a future update.`);
      return;
    }
    if (PATIENT_SCREENS.includes(tile.screen)) {
      navigation.navigate(tile.screen as any, { patientId: params.patientId, patientName: params.patientName });
    } else {
      navigation.navigate(tile.screen as any);
    }
  }

  const hasIntro = profile?.aboutMe || profile?.injuryLevel || profile?.routineHighlights || profile?.medicalNotes || profile?.emergencyContactName || profile?.caregiverNotes;
  const visibleTiles = CARE_TILES.filter((t) => t.roles.includes(params.role));

  async function handleExport() {
    setExporting(true);
    try {
      const token = await getToken();
      const pid = encodeURIComponent(params.patientId);
      const headers = { Authorization: `Bearer ${token}` };
      const api = getApiUrl();

      // Fetch handover notes + pressure injury checks (not in existing state)
      const notesRes = await fetch(`${api}/api/care/notes/${pid}`, { headers });
      const notesData = notesRes.ok ? await notesRes.json() : [];

      const checkResponses = await Promise.all(
        rawWounds.map((w: any) => fetch(`${api}/api/pressure-injuries/${w.id}/checks`, { headers }))
      );
      const checkData = await Promise.all(
        checkResponses.map((r) => r.ok ? r.json() : Promise.resolve([]))
      );
      const woundsWithChecks = rawWounds.map((w: any, i: number) => ({ ...w, checks: checkData[i] ?? [] }));

      await exportPatientPdf({
        patientName: params.patientName,
        profile: profile as any,
        vitals: rawVitals,
        wounds: woundsWithChecks,
        meds: rawMeds,
        notes: notesData,
        generatedBy: "Care Team",
      });
    } finally {
      setExporting(false);
    }
  }

  const roleColor = params.role === "clinician" ? "#AF52DE" : params.role === "family" ? "#5B8DEF" : "#00E676";

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: insets.bottom + Spacing.xl }}
      >
          {/* ── PATIENT HEADER ── */}
          <ElevatedCard style={styles.patientCard} padding={Spacing.md}>
            {/* Avatar row */}
            <View style={styles.headerRow}>
              <View style={[styles.avatar, { backgroundColor: theme.primary + "22" }]}>
                <ThemedText style={{ fontSize: 22, fontWeight: "800", color: theme.primary }}>
                  {params.patientName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4">{params.patientName}</ThemedText>
                {profile?.injuryLevel ? (
                  <ThemedText type="caption" style={{ opacity: 0.55, marginTop: 1 }}>
                    {[profile.injuryLevel, profile.injuryType].filter(Boolean).join(" · ")}
                  </ThemedText>
                ) : null}
              </View>
              <View style={[styles.roleBadge, { backgroundColor: roleColor + "22" }]}>
                <ThemedText type="caption" style={{ color: roleColor, fontWeight: "700", fontSize: 11 }}>
                  {params.role.charAt(0).toUpperCase() + params.role.slice(1)}
                </ThemedText>
              </View>
            </View>

            {/* Intro data — compact rows matching patient's own care intro style */}
            {!loading && hasIntro ? (
              <>
                {profile?.aboutMe ? (
                  <ThemedText type="small" style={{ lineHeight: 20, opacity: 0.85, marginTop: Spacing.sm }} numberOfLines={4}>
                    {profile.aboutMe}
                  </ThemedText>
                ) : null}
                {profile?.injuryDate || profile?.rehabCentre ? (
                  <View style={[styles.infoChip, { marginTop: Spacing.xs }]}>
                    {profile.injuryDate ? (
                      <>
                        <Feather name="calendar" size={12} color={theme.textSecondary} />
                        <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>Injured {profile.injuryDate}</ThemedText>
                      </>
                    ) : null}
                    {profile.rehabCentre ? (
                      <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: profile.injuryDate ? 8 : 0 }}>· {profile.rehabCentre}</ThemedText>
                    ) : null}
                  </View>
                ) : null}
                {profile?.caregiverNotes ? (
                  <View style={[styles.infoChip, { marginTop: Spacing.xs, alignItems: "flex-start" }]}>
                    <Feather name="alert-circle" size={12} color="#f97316" style={{ marginTop: 2 }} />
                    <ThemedText type="caption" style={{ opacity: 0.75, marginLeft: 4, flex: 1, color: "#f97316" }} numberOfLines={3}>
                      {profile.caregiverNotes}
                    </ThemedText>
                  </View>
                ) : null}
                {profile?.medicalNotes ? (
                  <View style={[styles.infoChip, { marginTop: Spacing.xs, alignItems: "flex-start" }]}>
                    <Feather name="alert-triangle" size={12} color="#FF9800" style={{ marginTop: 2 }} />
                    <ThemedText type="caption" style={{ opacity: 0.75, marginLeft: 4, flex: 1, color: "#FF9800" }} numberOfLines={3}>
                      {profile.medicalNotes}
                    </ThemedText>
                  </View>
                ) : null}
                {(profile?.emergencyContactName || profile?.emergencyContactPhone) ? (
                  <View style={[styles.infoChip, { marginTop: Spacing.xs }]}>
                    <Feather name="phone" size={12} color={theme.textSecondary} />
                    <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>
                      {[profile.emergencyContactName, profile.emergencyContactPhone].filter(Boolean).join("  ·  ")}
                    </ThemedText>
                  </View>
                ) : null}
                {profile?.routineHighlights ? (
                  <ThemedText type="caption" style={{ opacity: 0.55, marginTop: Spacing.sm }} numberOfLines={2}>
                    {profile.routineHighlights}
                  </ThemedText>
                ) : null}
                {profile?.allergies ? (
                  <View style={[styles.infoChip, { marginTop: Spacing.xs, alignItems: "flex-start" }]}>
                    <Feather name="alert-circle" size={12} color="#EF4444" style={{ marginTop: 2 }} />
                    <ThemedText type="caption" style={{ opacity: 0.75, marginLeft: 4, flex: 1, color: "#EF4444" }}>
                      <ThemedText type="caption" style={{ fontWeight: "700", color: "#EF4444" }}>Allergies: </ThemedText>
                      {profile.allergies}
                    </ThemedText>
                  </View>
                ) : null}
              </>
            ) : null}
          </ElevatedCard>

          {/* ── ESCALATION ALERTS ── */}
          {alerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: "#FF6B6B" }]} />
                <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  ESCALATION ALERTS
                </ThemedText>
              </View>
              {alerts.map((alert, i) => {
                const color = alert.severity === "critical" ? "#FF6B6B" : "#FF9800";
                return (
                  <View key={i} style={[styles.alertRow, { backgroundColor: color + "18", borderLeftColor: color }]}>
                    <Feather name={alert.icon as any} size={16} color={color} />
                    <ThemedText type="small" style={{ flex: 1, marginLeft: 10, color, fontWeight: "600", fontSize: 13 }}>
                      {alert.message}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}


          {/* ── HANDOVER NOTES ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#00E676" }]} />
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                HANDOVER NOTES
              </ThemedText>
            </View>
            <Pressable
              onPress={() => navigation.navigate("HandoverNotes", { patientId: params.patientId, patientName: params.patientName })}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <ElevatedCard style={styles.notesEntryRow} padding={Spacing.md}>
                <View style={[styles.notesEntryIcon, { backgroundColor: "#00E676" + "22" }]}>
                  <Feather name="book-open" size={20} color="#00E676" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>Open Handover Log</ThemedText>
                  <ThemedText type="caption" style={{ opacity: 0.5, marginTop: 1 }}>
                    Read entries and add notes day by day
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} style={{ opacity: 0.5 }} />
              </ElevatedCard>
            </Pressable>
          </View>

          {/* ── EXPORT PDF + AUDIT TRAIL (carer/clinician only) ── */}
          {(params.role === "carer" || params.role === "clinician") && (
            <View style={[styles.section, { marginBottom: Spacing.sm, gap: 8 }]}>
              <Pressable
                onPress={handleExport}
                disabled={exporting || loading}
                style={({ pressed }) => [
                  styles.exportBtn,
                  { opacity: pressed || exporting || loading ? 0.6 : 1 },
                ]}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="file-text" size={16} color="#fff" />
                )}
                <ThemedText style={styles.exportBtnText}>
                  {exporting ? "Generating PDF…" : "Export Clinical Report (PDF)"}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("AuditTrail", { patientId: params.patientId, patientName: params.patientName })}
                style={({ pressed }) => [styles.auditBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="clock" size={15} color={theme.textSecondary} />
                <ThemedText type="small" style={{ marginLeft: 8, fontWeight: "600", color: theme.textSecondary }}>
                  View Audit Trail
                </ThemedText>
                <Feather name="chevron-right" size={15} color={theme.textSecondary} style={{ marginLeft: "auto", opacity: 0.5 }} />
              </Pressable>
            </View>
          )}

          {/* ── CARE TOOLS (role-filtered) ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#4A90D9" }]} />
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                CARE TOOLS
              </ThemedText>
            </View>

            <View style={styles.tileGrid}>
              {visibleTiles.map((tile) => (
                <Pressable
                  key={tile.id}
                  onPress={() => handleTilePress(tile)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, width: TILE_WIDTH }]}
                >
                  <ElevatedCard style={styles.tile} padding={10}>
                    <View style={[styles.tileIcon, { backgroundColor: tile.color + "22" }]}>
                      <Feather name={tile.icon as any} size={18} color={tile.color} />
                    </View>
                    <ThemedText
                      type="small"
                      numberOfLines={1}
                      style={{ fontWeight: "600", fontSize: 11, marginTop: 6, lineHeight: 14 }}
                    >
                      {tile.label}
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      numberOfLines={2}
                      style={{ opacity: 0.5, fontSize: 9, marginTop: 2, lineHeight: 12 }}
                    >
                      {tile.sublabel}
                    </ThemedText>
                    {!tile.screen && (
                      <View style={styles.comingSoonBadge}>
                        <ThemedText style={{ fontSize: 8, color: theme.textSecondary, opacity: 0.6 }}>SOON</ThemedText>
                      </View>
                    )}
                  </ElevatedCard>
                </Pressable>
              ))}
            </View>
          </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  patientCard: {
    flexDirection: "column",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 2,
  },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, flex: 1 },
  sectionAction: { paddingVertical: 2, paddingHorizontal: 4 },
  introTopRow: { marginBottom: 4 },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.xs },
  infoChip: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  divider: { height: 1, marginVertical: Spacing.md },
  routineHeader: { flexDirection: "row", alignItems: "center" },
  alertBanner: { flexDirection: "row", alignItems: "flex-start", padding: 10, borderRadius: 8, borderWidth: 1, gap: 2 },
  notesEntryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  notesEntryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { position: "relative" },
  tileIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  comingSoonBadge: {
    position: "absolute",
    top: 8, right: 8,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4A90D9",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  exportBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  auditBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.2)",
  },
});
