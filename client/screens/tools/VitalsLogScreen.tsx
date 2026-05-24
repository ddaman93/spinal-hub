import React, { useState, useCallback, useMemo } from "react";
import {
  View, ScrollView, StyleSheet, Pressable, TextInput, Modal,
  ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { MainStackParamList } from "@/types/navigation";

type Route = RouteProp<MainStackParamList, "VitalsLog">;

type VitalEntry = {
  id: string;
  type: string;
  value: string;
  systolic?: number | null;
  diastolic?: number | null;
  notes?: string | null;
  authorName: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Vital type definitions
// ---------------------------------------------------------------------------

type VitalKey = "blood_pressure" | "heart_rate" | "oxygen" | "temperature" | "resp_rate";

type VitalConfig = {
  key: VitalKey;
  label: string;
  shortLabel: string;
  unit: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  placeholder: string | [string, string]; // [sys, dias] for BP
  reference: string;
  getScore: (entry: VitalEntry) => 0 | 1 | 2 | 3;
};

// NEWS2-derived scoring (0=normal, 1=low concern, 2=concern, 3=critical)
// SCI adaptation: systolic ≥150 = amber (Autonomic Dysreflexia risk)
function scoreBP(entry: VitalEntry): 0 | 1 | 2 | 3 {
  const sys = entry.systolic ?? parseInt(entry.value);
  if (isNaN(sys)) return 0;
  if (sys < 91 || sys >= 220) return 3;
  if (sys < 101) return 2;
  if (sys < 111 || sys >= 150) return 1;
  return 0;
}

function scoreHR(entry: VitalEntry): 0 | 1 | 2 | 3 {
  const hr = parseFloat(entry.value);
  if (isNaN(hr)) return 0;
  if (hr < 40 || hr > 130) return 3;
  if (hr < 41 || hr > 110) return 2;
  if (hr < 51 || hr > 90) return 1;
  return 0;
}

function scoreO2(entry: VitalEntry): 0 | 1 | 2 | 3 {
  const o2 = parseFloat(entry.value);
  if (isNaN(o2)) return 0;
  if (o2 < 92) return 3;
  if (o2 < 94) return 2;
  if (o2 < 96) return 1;
  return 0;
}

function scoreTemp(entry: VitalEntry): 0 | 1 | 2 | 3 {
  const t = parseFloat(entry.value);
  if (isNaN(t)) return 0;
  if (t < 35) return 3;
  if (t > 39) return 2;
  if (t < 36.1 || t > 38) return 1;
  return 0;
}

function scoreRR(entry: VitalEntry): 0 | 1 | 2 | 3 {
  const rr = parseFloat(entry.value);
  if (isNaN(rr)) return 0;
  if (rr < 8 || rr > 25) return 3;
  if (rr < 12 || rr > 20) return 1;
  return 0;
}

const SCORE_COLORS = ["#22c55e", "#f59e0b", "#f97316", "#ef4444"] as const;
const SCORE_BG = ["#22c55e22", "#f59e0b22", "#f9731622", "#ef444422"] as const;
const SCORE_LABELS = ["Normal", "Low concern", "Concern", "Critical"] as const;

const CHART_COLORS: Record<VitalKey, string> = {
  blood_pressure: "#ef4444",
  heart_rate: "#f97316",
  oxygen: "#06B6D4",
  temperature: "#f59e0b",
  resp_rate: "#8B5CF6",
};

const CHART_REFS: Partial<Record<VitalKey, { min: number; max: number }>> = {
  blood_pressure: { min: 90, max: 149 },
  heart_rate: { min: 51, max: 90 },
  oxygen: { min: 96, max: 100 },
  temperature: { min: 36.1, max: 38.0 },
  resp_rate: { min: 12, max: 20 },
};

function chartLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

const VITAL_CONFIGS: VitalConfig[] = [
  {
    key: "blood_pressure",
    label: "Blood Pressure",
    shortLabel: "BP",
    unit: "mmHg",
    icon: "activity",
    placeholder: ["120", "80"],
    reference: "111–149 / <90",
    getScore: scoreBP,
  },
  {
    key: "heart_rate",
    label: "Heart Rate",
    shortLabel: "HR",
    unit: "bpm",
    icon: "heart",
    placeholder: "72",
    reference: "51–90",
    getScore: scoreHR,
  },
  {
    key: "oxygen",
    label: "SpO₂",
    shortLabel: "SpO₂",
    unit: "%",
    icon: "wind",
    placeholder: "98",
    reference: "≥96%",
    getScore: scoreO2,
  },
  {
    key: "temperature",
    label: "Temperature",
    shortLabel: "Temp",
    unit: "°C",
    icon: "thermometer",
    placeholder: "37.0",
    reference: "36.1–38°C",
    getScore: scoreTemp,
  },
  {
    key: "resp_rate",
    label: "Respiratory Rate",
    shortLabel: "RR",
    unit: "br/min",
    icon: "maximize-2",
    placeholder: "16",
    reference: "12–20",
    getScore: scoreRR,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(dateStr).toLocaleDateString("en-NZ");
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
}

function getConfig(key: string): VitalConfig | undefined {
  return VITAL_CONFIGS.find((v) => v.key === key);
}

function displayValue(entry: VitalEntry): string {
  if (entry.type === "blood_pressure" && entry.systolic && entry.diastolic) {
    return `${entry.systolic}/${entry.diastolic}`;
  }
  return entry.value;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function VitalsLogScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { params } = useRoute<Route>();
  const patientId = params?.patientId ?? "";
  const patientName = params?.patientName ?? "";

  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<VitalKey>("blood_pressure");
  const [activeTab, setActiveTab] = useState<"current" | "trends">("current");
  const [trendVitalKey, setTrendVitalKey] = useState<VitalKey>("blood_pressure");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");
  const [value, setValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/vitals?patientId=${encodeURIComponent(patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setEntries(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const body: Record<string, unknown> = { patientId, type: selectedType };
      if (selectedType === "blood_pressure") {
        if (!systolic || !diastolic) { Alert.alert("Missing", "Enter both systolic and diastolic."); return; }
        body.value = `${systolic}/${diastolic}`;
        body.systolic = parseInt(systolic);
        body.diastolic = parseInt(diastolic);
      } else {
        if (!value) { Alert.alert("Missing", "Enter a value."); return; }
        body.value = value;
      }
      if (notes) body.notes = notes;

      const res = await fetch(`${getApiUrl()}/api/health/vitals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { await load(); setModalVisible(false); resetForm(); }
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete reading", "Remove this vital sign reading?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/health/vitals/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          setEntries((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const resetForm = () => {
    setValue(""); setSystolic(""); setDiastolic(""); setNotes("");
    setSelectedType("blood_pressure");
  };

  // Derive latest reading per vital type
  const latest: Record<string, VitalEntry> = {};
  for (const e of [...entries].reverse()) {
    if (!latest[e.type]) latest[e.type] = e;
  }

  // AD alert: systolic BP ≥150
  const latestBP = latest["blood_pressure"];
  const adAlert = latestBP && latestBP.systolic != null && latestBP.systolic >= 150;

  // Group entries by date for history
  const groups: { label: string; items: VitalEntry[] }[] = [];
  for (const entry of entries) {
    const label = formatGroupDate(entry.createdAt);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(entry);
    else groups.push({ label, items: [entry] });
  }

  const cfg = VITAL_CONFIGS.find((v) => v.key === selectedType)!;

  // Trend chart data
  const trendEntries = useMemo(() => {
    const now = Date.now();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 0;
    return entries
      .filter((e) => e.type === trendVitalKey && (days === 0 || now - new Date(e.createdAt).getTime() < days * 86400000))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [entries, trendVitalKey, timeRange]);

  const chartWidth = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2;

  const { lineData, line2Data } = useMemo(() => {
    const total = trendEntries.length;
    const skipLabel = (i: number) => total <= 6 ? false : i % Math.ceil(total / 5) !== 0 && i !== 0 && i !== total - 1;
    if (trendVitalKey === "blood_pressure") {
      return {
        lineData: trendEntries.map((e, i) => ({ value: e.systolic ?? 0, label: skipLabel(i) ? "" : chartLabel(e.createdAt) })),
        line2Data: trendEntries.map((e, i) => ({ value: e.diastolic ?? 0, label: skipLabel(i) ? "" : chartLabel(e.createdAt) })),
      };
    }
    return {
      lineData: trendEntries.map((e, i) => ({ value: parseFloat(e.value) || 0, label: skipLabel(i) ? "" : chartLabel(e.createdAt) })),
      line2Data: undefined,
    };
  }, [trendEntries, trendVitalKey]);

  const trendStats = useMemo(() => {
    if (lineData.length === 0) return null;
    const vals = lineData.map((d) => d.value).filter((v) => v > 0);
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    };
  }, [lineData]);

  const trendColor = CHART_COLORS[trendVitalKey];
  const trendRef = CHART_REFS[trendVitalKey];
  const trendCfg = VITAL_CONFIGS.find((v) => v.key === trendVitalKey)!;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* ── AD ALERT BANNER ── */}
        {adAlert && (
          <View style={styles.adBanner}>
            <Feather name="alert-triangle" size={18} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.adBannerTitle}>Autonomic Dysreflexia Risk</ThemedText>
              <ThemedText style={styles.adBannerBody}>
                Systolic BP {latestBP.systolic} mmHg ≥ 150. Check for triggers and manage urgently.
              </ThemedText>
            </View>
          </View>
        )}

        {/* ── TAB TOGGLE ── */}
        <View style={[styles.tabRow, { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }]}>
          {(["current", "trends"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, { backgroundColor: activeTab === tab ? theme.primary : theme.backgroundDefault }]}
            >
              <Feather name={tab === "current" ? "activity" : "trending-up"} size={14} color={activeTab === tab ? "#fff" : theme.textSecondary} />
              <ThemedText style={{ fontSize: 13, fontWeight: "600", color: activeTab === tab ? "#fff" : theme.textSecondary, marginLeft: 6 }}>
                {tab === "current" ? "Current" : "Trends"}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {activeTab === "trends" ? (
          <View style={{ paddingBottom: Spacing.xl }}>
            {/* Vital type selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.md }} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
              {VITAL_CONFIGS.map((v) => {
                const active = trendVitalKey === v.key;
                const color = CHART_COLORS[v.key];
                return (
                  <Pressable
                    key={v.key}
                    onPress={() => setTrendVitalKey(v.key)}
                    style={[styles.typeChip, { backgroundColor: active ? color : theme.backgroundDefault }]}
                  >
                    <Feather name={v.icon} size={13} color={active ? "#fff" : theme.textSecondary} />
                    <ThemedText style={{ fontSize: 12, fontWeight: "600", color: active ? "#fff" : theme.text }}>{v.shortLabel}</ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Time range toggle */}
            <View style={[styles.tabRow, { paddingHorizontal: Spacing.lg, marginTop: Spacing.sm }]}>
              {(["7d", "30d", "all"] as const).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setTimeRange(r)}
                  style={[styles.rangeBtn, { backgroundColor: timeRange === r ? trendColor + "22" : theme.backgroundDefault, borderColor: timeRange === r ? trendColor : "transparent" }]}
                >
                  <ThemedText style={{ fontSize: 12, fontWeight: "700", color: timeRange === r ? trendColor : theme.textSecondary }}>
                    {r === "all" ? "All time" : r}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Chart */}
            <View style={[styles.chartCard, { backgroundColor: theme.backgroundDefault, marginHorizontal: Spacing.lg }]}>
              {trendVitalKey === "blood_pressure" && (
                <View style={styles.chartLegend}>
                  <View style={styles.legendDot} />
                  <ThemedText style={[styles.legendText, { color: "#ef4444" }]}>Systolic</ThemedText>
                  <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                  <ThemedText style={[styles.legendText, { color: "#3B82F6" }]}>Diastolic</ThemedText>
                </View>
              )}

              {lineData.length < 2 ? (
                <View style={styles.noDataBox}>
                  <Feather name="trending-up" size={32} color={trendColor} style={{ opacity: 0.3 }} />
                  <ThemedText style={[styles.noDataText, { color: theme.textSecondary }]}>
                    {lineData.length === 0 ? "No data for this period" : "Log at least 2 readings to see a trend"}
                  </ThemedText>
                </View>
              ) : (
                <LineChart
                  data={lineData}
                  data2={line2Data}
                  width={chartWidth}
                  height={180}
                  color={trendColor}
                  color2="#3B82F6"
                  thickness={2.5}
                  thickness2={2.5}
                  hideDataPoints={lineData.length > 15}
                  dataPointsColor={trendColor}
                  dataPointsColor2="#3B82F6"
                  dataPointsRadius={4}
                  xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
                  yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
                  rulesType="solid"
                  rulesColor={theme.border ?? "rgba(0,0,0,0.05)"}
                  yAxisColor="transparent"
                  xAxisColor={theme.border ?? "rgba(0,0,0,0.08)"}
                  showReferenceLine1={!!trendRef}
                  referenceLine1Position={trendRef?.max ?? 0}
                  referenceLine1Config={{ color: "#22c55e55", dashWidth: 5, dashGap: 4, thickness: 1.5, labelText: "Max normal", labelTextStyle: { color: "#22c55e", fontSize: 9 } }}
                  showReferenceLine2={!!trendRef}
                  referenceLine2Position={trendRef?.min ?? 0}
                  referenceLine2Config={{ color: "#22c55e55", dashWidth: 5, dashGap: 4, thickness: 1.5, labelText: "Min normal", labelTextStyle: { color: "#22c55e", fontSize: 9 } }}
                  isAnimated
                  curved
                  initialSpacing={10}
                  endSpacing={10}
                  noOfSections={4}
                />
              )}

              {/* Stats row */}
              {trendStats && lineData.length >= 2 && (
                <View style={[styles.statsRow, { borderTopColor: theme.border ?? "rgba(0,0,0,0.06)" }]}>
                  {[
                    { label: "Min", value: `${trendStats.min}` },
                    { label: "Avg", value: `${trendStats.avg}` },
                    { label: "Max", value: `${trendStats.max}` },
                    { label: "Readings", value: `${lineData.length}` },
                  ].map((s) => (
                    <View key={s.label} style={styles.statItem}>
                      <ThemedText style={[styles.statValue, { color: trendColor }]}>{s.value}</ThemedText>
                      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {trendRef && (
              <View style={[styles.refReminder, { marginHorizontal: Spacing.lg, marginTop: Spacing.sm, backgroundColor: theme.backgroundDefault }]}>
                <View style={[styles.refDot, { backgroundColor: "#22c55e" }]} />
                <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>
                  Normal range: <ThemedText style={{ fontWeight: "700", color: theme.text }}>{trendCfg.reference} {trendCfg.unit}</ThemedText>
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <>
        {/* ── CURRENT READINGS GRID ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>CURRENT READINGS</ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.lg }} />
          ) : (
            <View style={styles.tileGrid}>
              {VITAL_CONFIGS.map((cfg) => {
                const entry = latest[cfg.key];
                const score = entry ? cfg.getScore(entry) : null;
                const color = score != null ? SCORE_COLORS[score] : theme.textSecondary;
                const bg = score != null ? SCORE_BG[score] : theme.backgroundDefault;
                const scoreLabel = score != null ? SCORE_LABELS[score] : null;
                return (
                  <Pressable
                    key={cfg.key}
                    onPress={() => { setSelectedType(cfg.key); setModalVisible(true); }}
                    style={[styles.vitalTile, { backgroundColor: theme.backgroundDefault }]}
                  >
                    {/* color indicator strip */}
                    <View style={[styles.tileStrip, { backgroundColor: color }]} />

                    <View style={styles.tileContent}>
                      {/* icon + label row */}
                      <View style={styles.tileTop}>
                        <View style={[styles.tileIconBg, { backgroundColor: bg }]}>
                          <Feather name={cfg.icon} size={14} color={color} />
                        </View>
                        <ThemedText style={[styles.tileLabel, { color: theme.textSecondary }]}>{cfg.shortLabel}</ThemedText>
                      </View>

                      {/* value */}
                      {entry ? (
                        <>
                          <ThemedText style={[styles.tileValue, { color: theme.text }]}>
                            {displayValue(entry)}
                          </ThemedText>
                          <ThemedText style={[styles.tileUnit, { color: theme.textSecondary }]}>{cfg.unit}</ThemedText>
                          <View style={[styles.tileScorePill, { backgroundColor: bg }]}>
                            <ThemedText style={{ fontSize: 9, fontWeight: "700", color }}>{scoreLabel?.toUpperCase()}</ThemedText>
                          </View>
                          <ThemedText style={[styles.tileAgo, { color: theme.textSecondary }]}>{timeAgo(entry.createdAt)}</ThemedText>
                        </>
                      ) : (
                        <>
                          <ThemedText style={[styles.tileValueEmpty, { color: theme.textSecondary }]}>—</ThemedText>
                          <ThemedText style={[styles.tileUnit, { color: theme.textSecondary }]}>{cfg.unit}</ThemedText>
                          <ThemedText style={[styles.tileAgo, { color: theme.textSecondary }]}>No reading</ThemedText>
                        </>
                      )}
                    </View>

                    {/* tap to add indicator */}
                    <View style={styles.tilePlusBtn}>
                      <Feather name="plus" size={12} color={theme.textSecondary} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── REFERENCE RANGES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#5B8DEF" }]} />
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>NEWS2 REFERENCE RANGES</ThemedText>
          </View>
          <View style={[styles.refCard, { backgroundColor: theme.backgroundDefault }]}>
            {VITAL_CONFIGS.map((cfg, i) => (
              <View
                key={cfg.key}
                style={[styles.refRow, i < VITAL_CONFIGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border ?? "#E0E0E0" }]}
              >
                <ThemedText style={[styles.refLabel, { color: theme.textSecondary }]}>{cfg.label}</ThemedText>
                <View style={styles.refRight}>
                  <View style={[styles.refDot, { backgroundColor: "#22c55e" }]} />
                  <ThemedText style={{ fontSize: 12, color: theme.text }}>{cfg.reference}</ThemedText>
                </View>
              </View>
            ))}
            <View style={[styles.adRefRow, { backgroundColor: "#ef444414", borderRadius: BorderRadius.small }]}>
              <Feather name="alert-triangle" size={12} color="#ef4444" />
              <ThemedText style={{ fontSize: 11, color: "#ef4444", flex: 1 }}>
                SCI: Systolic BP ≥150 mmHg = Autonomic Dysreflexia risk — escalate immediately
              </ThemedText>
            </View>
          </View>
        </View>

        {/* ── HISTORY ── */}
        {groups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#9C27B0" }]} />
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>OBSERVATION HISTORY</ThemedText>
            </View>

            {groups.map((group) => (
              <View key={group.label} style={styles.historyGroup}>
                <ThemedText style={[styles.historyGroupLabel, { color: theme.textSecondary }]}>{group.label}</ThemedText>
                <View style={[styles.historyCard, { backgroundColor: theme.backgroundDefault }]}>
                  {group.items.map((entry, i) => {
                    const vc = getConfig(entry.type);
                    const score = vc ? vc.getScore(entry) : 0;
                    const color = SCORE_COLORS[score];
                    const isLast = i === group.items.length - 1;
                    return (
                      <View
                        key={entry.id}
                        style={[
                          styles.historyRow,
                          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border ?? "#E0E0E0" },
                        ]}
                      >
                        {/* color score indicator */}
                        <View style={[styles.historyScoreDot, { backgroundColor: color }]} />

                        <View style={{ flex: 1 }}>
                          <View style={styles.historyRowTop}>
                            <ThemedText style={styles.historyVitalName}>{vc?.label ?? entry.type}</ThemedText>
                            <ThemedText style={[styles.historyValue, { color }]}>
                              {displayValue(entry)} {vc?.unit}
                            </ThemedText>
                          </View>
                          <ThemedText style={[styles.historyMeta, { color: theme.textSecondary }]}>
                            {entry.authorName} · {timeAgo(entry.createdAt)}
                          </ThemedText>
                          {entry.notes ? (
                            <ThemedText style={[styles.historyNotes, { color: theme.textSecondary }]}>{entry.notes}</ThemedText>
                          ) : null}
                        </View>

                        <Pressable
                          onPress={() => handleDelete(entry.id)}
                          style={[styles.historyDelete, { backgroundColor: theme.error + "18" }]}
                        >
                          <Feather name="trash-2" size={14} color={theme.error} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {entries.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Feather name="activity" size={40} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center", opacity: 0.6 }}>
              No observations recorded yet.{"\n"}Tap a reading tile above to log the first entry.
            </ThemedText>
          </View>
        )}
          </>
        )}
      </ScrollView>

      {/* ── ADD READING BUTTON ── */}
      <View style={[styles.addBarContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.addBar, { backgroundColor: theme.primary }]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addBarText}>Record Observation</ThemedText>
        </Pressable>
      </View>

      {/* ── LOG MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Record Observation</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {/* vital type selector */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>VITAL SIGN</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeScrollContent}>
              {VITAL_CONFIGS.map((v) => (
                <Pressable
                  key={v.key}
                  onPress={() => setSelectedType(v.key)}
                  style={[
                    styles.typeChip,
                    selectedType === v.key
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: theme.backgroundDefault },
                  ]}
                >
                  <Feather name={v.icon} size={14} color={selectedType === v.key ? "#FFFFFF" : theme.textSecondary} />
                  <ThemedText style={{ fontSize: 13, fontWeight: "600", color: selectedType === v.key ? "#FFFFFF" : theme.text }}>
                    {v.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            {/* reference range reminder */}
            <View style={[styles.refReminder, { backgroundColor: theme.backgroundDefault }]}>
              <View style={[styles.refDot, { backgroundColor: "#22c55e" }]} />
              <ThemedText style={{ fontSize: 13, color: theme.textSecondary }}>
                Normal: <ThemedText style={{ fontWeight: "700", color: theme.text }}>{cfg.reference}</ThemedText>  ·  {cfg.unit}
              </ThemedText>
            </View>

            {/* value input */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>VALUE</ThemedText>
            {selectedType === "blood_pressure" ? (
              <View style={styles.bpRow}>
                <View style={styles.bpField}>
                  <ThemedText style={[styles.bpFieldLabel, { color: theme.textSecondary }]}>Systolic</ThemedText>
                  <TextInput
                    value={systolic}
                    onChangeText={setSystolic}
                    keyboardType="numeric"
                    placeholder="120"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.bigInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                    maxLength={3}
                  />
                </View>
                <ThemedText style={[styles.bpSlash, { color: theme.textSecondary }]}>/</ThemedText>
                <View style={styles.bpField}>
                  <ThemedText style={[styles.bpFieldLabel, { color: theme.textSecondary }]}>Diastolic</ThemedText>
                  <TextInput
                    value={diastolic}
                    onChangeText={setDiastolic}
                    keyboardType="numeric"
                    placeholder="80"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.bigInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                    maxLength={3}
                  />
                </View>
                <ThemedText style={[styles.bpUnit, { color: theme.textSecondary }]}>mmHg</ThemedText>
              </View>
            ) : (
              <View style={styles.singleInputRow}>
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  keyboardType="decimal-pad"
                  placeholder={Array.isArray(cfg.placeholder) ? cfg.placeholder[0] : cfg.placeholder}
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.bigInput, styles.bigInputFull, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                />
                <ThemedText style={[styles.singleUnit, { color: theme.textSecondary }]}>{cfg.unit}</ThemedText>
              </View>
            )}

            {/* notes */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>NOTES (OPTIONAL)</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Position, symptoms, context..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <Button onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? "Saving…" : "Record Observation"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TILE_WIDTH = 130;

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* section */
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  /* AD banner */
  adBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm,
    backgroundColor: "#ef4444", padding: Spacing.md, margin: Spacing.lg,
    borderRadius: BorderRadius.medium,
  },
  adBannerTitle: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  adBannerBody: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2, lineHeight: 16 },

  /* vital tiles */
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  vitalTile: {
    width: TILE_WIDTH,
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    position: "relative",
  },
  tileStrip: { height: 4, width: "100%" },
  tileContent: { padding: Spacing.sm, gap: 3 },
  tileTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  tileIconBg: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tileLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  tileValue: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, lineHeight: 30 },
  tileValueEmpty: { fontSize: 26, fontWeight: "300", lineHeight: 30 },
  tileUnit: { fontSize: 11 },
  tileScorePill: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  tileAgo: { fontSize: 10, marginTop: 2 },
  tilePlusBtn: {
    position: "absolute", top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center", justifyContent: "center",
  },

  /* reference card */
  refCard: { borderRadius: BorderRadius.medium, overflow: "hidden" },
  refRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: 10 },
  refLabel: { fontSize: 13 },
  refRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  refDot: { width: 8, height: 8, borderRadius: 4 },
  adRefRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: Spacing.md, margin: Spacing.sm, marginTop: 0 },

  /* history */
  historyGroup: { marginBottom: Spacing.md },
  historyGroupLabel: { fontSize: 12, fontWeight: "700", marginBottom: Spacing.xs, letterSpacing: 0.3 },
  historyCard: { borderRadius: BorderRadius.medium, overflow: "hidden" },
  historyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: 10, gap: Spacing.sm },
  historyScoreDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  historyRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  historyVitalName: { fontSize: 14, fontWeight: "600" },
  historyValue: { fontSize: 15, fontWeight: "800" },
  historyMeta: { fontSize: 11 },
  historyNotes: { fontSize: 12, fontStyle: "italic", marginTop: 2 },
  historyDelete: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  /* empty */
  emptyContainer: { alignItems: "center", paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },

  /* add bar */
  addBarContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.08)" },
  addBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, height: 52, borderRadius: 14 },
  addBarText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  /* tab toggle */
  tabRow: { flexDirection: "row", gap: Spacing.sm },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: BorderRadius.medium },
  rangeBtn: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: BorderRadius.small, borderWidth: 1 },

  /* chart */
  chartCard: { borderRadius: BorderRadius.medium, padding: Spacing.md, marginTop: Spacing.sm, overflow: "hidden" },
  chartLegend: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" },
  legendText: { fontSize: 11, fontWeight: "600", marginRight: 8 },
  noDataBox: { height: 180, alignItems: "center", justifyContent: "center", gap: Spacing.sm },
  noDataText: { fontSize: 13, textAlign: "center", opacity: 0.5 },
  statsRow: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.md, paddingTop: Spacing.sm },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600", opacity: 0.6, marginTop: 2 },

  /* modal */
  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  typeScroll: { marginHorizontal: -Spacing.xl },
  typeScrollContent: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing.sm },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: 20 },
  refReminder: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.medium, marginTop: Spacing.sm },
  bpRow: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.md },
  bpField: { flex: 1, gap: 4 },
  bpFieldLabel: { fontSize: 12, fontWeight: "600" },
  bpSlash: { fontSize: 36, fontWeight: "300", marginBottom: Spacing.sm },
  bpUnit: { fontSize: 13, marginBottom: Spacing.sm, flexShrink: 0 },
  singleInputRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  singleUnit: { fontSize: 14, fontWeight: "600" },
  bigInput: { height: 64, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 28, fontWeight: "700", textAlign: "center" },
  bigInputFull: { flex: 1 },
  notesInput: { height: 90, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 15, textAlignVertical: "top", marginBottom: Spacing.md },
  saveButton: { marginTop: Spacing.sm },
});
