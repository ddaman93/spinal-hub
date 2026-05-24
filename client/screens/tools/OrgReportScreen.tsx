import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator, Pressable, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type PatientSummary = { patientId: string; patientName: string; activeWounds: number };

type AuditEvent = {
  id: string;
  patientId: string;
  patientName: string;
  actorName: string;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
};

type OrgReport = {
  patientCount: number;
  activeWounds: number;
  criticalWounds: number;
  medAdherence7d: number | null;
  rehabGoalsActive: number;
  rehabGoalsAchieved: number;
  recentEvents: AuditEvent[];
  patientSummaries: PatientSummary[];
};

const ACTION_COLORS: Record<string, string> = {
  administered: "#34C759",
  omitted: "#FF3B30",
  achieved: "#FFD60A",
  assessed: "#5B8DEF",
  status_changed: "#FF9800",
  created: "#AF52DE",
  deleted: "#8E8E93",
};

const ACTION_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  administered: "check-circle",
  omitted: "x-circle",
  achieved: "award",
  assessed: "eye",
  status_changed: "refresh-cw",
  created: "plus-circle",
  deleted: "trash-2",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(dateStr).toLocaleDateString();
}

export default function OrgReportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [report, setReport] = useState<OrgReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/care/org-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReport(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleExport() {
    if (!report) return;
    setExporting(true);
    try {
      const now = new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
      const adherenceStr = report.medAdherence7d !== null ? `${report.medAdherence7d}%` : "N/A";

      const patientRows = report.patientSummaries
        .map((p) => `<tr><td>${p.patientName}</td><td>${p.activeWounds}</td></tr>`)
        .join("");

      const eventRows = report.recentEvents
        .map((e) => `<tr><td>${e.patientName}</td><td>${e.summary}</td><td>${e.actorName}</td><td>${timeAgo(e.createdAt)}</td></tr>`)
        .join("");

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: -apple-system, sans-serif; color: #111; padding: 32px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 28px; }
  .metrics { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
  .metric { background: #f4f4f4; border-radius: 10px; padding: 16px 20px; flex: 1; min-width: 120px; }
  .metric-value { font-size: 28px; font-weight: 800; color: #111; }
  .metric-label { font-size: 12px; color: #666; margin-top: 2px; }
  .metric.critical .metric-value { color: #FF3B30; }
  .metric.green .metric-value { color: #34C759; }
  h2 { font-size: 15px; font-weight: 700; margin-bottom: 10px; margin-top: 28px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px; background: #f4f4f4; font-size: 11px; text-transform: uppercase; }
  td { padding: 8px; border-bottom: 1px solid #eee; }
  .footer { margin-top: 40px; color: #aaa; font-size: 11px; }
</style></head><body>
<h1>Organisation Care Report</h1>
<div class="subtitle">Generated ${now} · Spinal Hub</div>
<div class="metrics">
  <div class="metric"><div class="metric-value">${report.patientCount}</div><div class="metric-label">Patients in care</div></div>
  <div class="metric ${report.criticalWounds > 0 ? "critical" : ""}"><div class="metric-value">${report.activeWounds}</div><div class="metric-label">Active wounds${report.criticalWounds > 0 ? ` (${report.criticalWounds} critical)` : ""}</div></div>
  <div class="metric ${report.medAdherence7d !== null && report.medAdherence7d >= 80 ? "green" : ""}"><div class="metric-value">${adherenceStr}</div><div class="metric-label">Med adherence (7d)</div></div>
  <div class="metric green"><div class="metric-value">${report.rehabGoalsAchieved}</div><div class="metric-label">Rehab goals achieved</div></div>
</div>
<h2>Patients</h2>
<table><thead><tr><th>Name</th><th>Active wounds</th></tr></thead><tbody>${patientRows}</tbody></table>
<h2>Recent Clinical Events</h2>
<table><thead><tr><th>Patient</th><th>Event</th><th>By</th><th>When</th></tr></thead><tbody>${eventRows}</tbody></table>
<div class="footer">Spinal Hub Clinical Report · Confidential · ${now}</div>
</body></html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Org Report" });
    } catch (err) {
      Alert.alert("Export failed", "Could not generate PDF.");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  if (!report || report.patientCount === 0) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl }}>
        <Feather name="users" size={40} color={theme.primary} style={{ opacity: 0.3 }} />
        <ThemedText type="caption" style={{ opacity: 0.4, marginTop: Spacing.md, textAlign: "center" }}>
          No patients linked yet.{"\n"}Link patients to generate an org report.
        </ThemedText>
      </ThemedView>
    );
  }

  const adherenceColor = report.medAdherence7d === null ? theme.textSecondary
    : report.medAdherence7d >= 80 ? "#34C759"
    : report.medAdherence7d >= 60 ? "#FF9800"
    : "#FF3B30";

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* ── METRIC CARDS ── */}
        <View style={styles.section}>
          <View style={styles.metricGrid}>
            <ElevatedCard style={styles.metricCard} padding={Spacing.md}>
              <ThemedText style={[styles.metricValue, { color: theme.primary }]}>{report.patientCount}</ThemedText>
              <ThemedText type="caption" style={styles.metricLabel}>Patients in care</ThemedText>
            </ElevatedCard>

            <ElevatedCard style={styles.metricCard} padding={Spacing.md}>
              <ThemedText style={[styles.metricValue, { color: report.criticalWounds > 0 ? "#FF3B30" : theme.text }]}>
                {report.activeWounds}
              </ThemedText>
              <ThemedText type="caption" style={styles.metricLabel}>
                Active wounds{report.criticalWounds > 0 ? `\n${report.criticalWounds} critical` : ""}
              </ThemedText>
              {report.criticalWounds > 0 && (
                <View style={styles.criticalChip}>
                  <Feather name="alert-triangle" size={10} color="#FF3B30" />
                  <ThemedText style={{ fontSize: 10, color: "#FF3B30", fontWeight: "700", marginLeft: 3 }}>
                    {report.criticalWounds} critical
                  </ThemedText>
                </View>
              )}
            </ElevatedCard>

            <ElevatedCard style={styles.metricCard} padding={Spacing.md}>
              <ThemedText style={[styles.metricValue, { color: adherenceColor }]}>
                {report.medAdherence7d !== null ? `${report.medAdherence7d}%` : "—"}
              </ThemedText>
              <ThemedText type="caption" style={styles.metricLabel}>Med adherence{"\n"}(7 days)</ThemedText>
            </ElevatedCard>

            <ElevatedCard style={styles.metricCard} padding={Spacing.md}>
              <ThemedText style={[styles.metricValue, { color: "#34C759" }]}>{report.rehabGoalsAchieved}</ThemedText>
              <ThemedText type="caption" style={styles.metricLabel}>
                Goals achieved{"\n"}{report.rehabGoalsActive} active
              </ThemedText>
            </ElevatedCard>
          </View>
        </View>

        {/* ── PATIENT SUMMARY ── */}
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>PATIENTS</ThemedText>
          {report.patientSummaries.map((p) => (
            <View key={p.patientId} style={[styles.patientRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.patientAvatar, { backgroundColor: theme.primary + "22" }]}>
                <ThemedText style={{ fontSize: 14, fontWeight: "800", color: theme.primary }}>
                  {p.patientName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ flex: 1, fontWeight: "600" }}>{p.patientName}</ThemedText>
              {p.activeWounds > 0 && (
                <View style={styles.woundChip}>
                  <Feather name="alert-circle" size={11} color="#FF3B30" />
                  <ThemedText style={{ fontSize: 11, color: "#FF3B30", fontWeight: "700", marginLeft: 3 }}>
                    {p.activeWounds} wound{p.activeWounds !== 1 ? "s" : ""}
                  </ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── RECENT EVENTS ── */}
        {report.recentEvents.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              RECENT CLINICAL EVENTS
            </ThemedText>
            {report.recentEvents.map((e) => {
              const color = ACTION_COLORS[e.action] ?? "#8E8E93";
              const icon = ACTION_ICONS[e.action] ?? "activity";
              return (
                <View key={e.id} style={[styles.eventRow, { borderBottomColor: theme.border }]}>
                  <View style={[styles.eventIcon, { backgroundColor: color + "22" }]}>
                    <Feather name={icon} size={13} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ fontWeight: "600" }} numberOfLines={1}>{e.summary}</ThemedText>
                    <ThemedText type="caption" style={{ opacity: 0.55, marginTop: 1 }}>
                      {e.patientName} · {e.actorName}
                    </ThemedText>
                  </View>
                  <ThemedText type="caption" style={{ opacity: 0.4, marginLeft: Spacing.sm }}>{timeAgo(e.createdAt)}</ThemedText>
                </View>
              );
            })}
          </View>
        )}

        {/* ── EXPORT ── */}
        <View style={[styles.section, { marginTop: Spacing.sm }]}>
          <Pressable
            onPress={handleExport}
            disabled={exporting}
            style={({ pressed }) => [styles.exportBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            {exporting
              ? <ActivityIndicator color="#fff" size="small" />
              : (
                <>
                  <Feather name="file-text" size={16} color="#fff" />
                  <ThemedText style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>Export PDF Report</ThemedText>
                </>
              )}
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: "47%" },
  metricValue: { fontSize: 30, fontWeight: "800", lineHeight: 34 },
  metricLabel: { opacity: 0.55, marginTop: 2, lineHeight: 16 },
  criticalChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FF3B3022", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, marginTop: 6, alignSelf: "flex-start",
  },
  patientRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  patientAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  woundChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FF3B3022", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  eventRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eventIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  exportBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: Spacing.md, borderRadius: BorderRadius.medium, gap: 6,
  },
});
