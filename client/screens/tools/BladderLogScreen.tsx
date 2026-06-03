import React, { useState, useCallback } from "react";
import {
  View, ScrollView, StyleSheet, Pressable, TextInput, Modal,
  ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { MainStackParamList } from "@/types/navigation";

type Route = RouteProp<MainStackParamList, "BladderLog">;

type BladderEntry = {
  id: string;
  type: "catheterization" | "spontaneous" | "leak" | "accident";
  volumeMl?: number | null;
  notes?: string | null;
  authorName: string;
  createdAt: string;
};

type VoidType = BladderEntry["type"];

const VOID_TYPES: { key: VoidType; label: string; shortLabel: string; color: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { key: "catheterization", label: "Catheterization", shortLabel: "CATH", color: "#007AFF", icon: "droplet" },
  { key: "spontaneous",     label: "Spontaneous",     shortLabel: "VOID", color: "#22c55e", icon: "check-circle" },
  { key: "leak",            label: "Leak",             shortLabel: "LEAK", color: "#f97316", icon: "alert-circle" },
  { key: "accident",        label: "Accident",         shortLabel: "ACC",  color: "#ef4444", icon: "x-circle" },
];

const QUICK_VOLUMES = [100, 200, 300, 400, 500];
const DAILY_TARGET_ML = 1800;
const OVERDUE_HOURS = 5;
// Industry default per Consortium for Spinal Cord Medicine continence guidelines
const DEFAULT_HIGH_VOLUME_THRESHOLD = 500;
const THRESHOLD_KEY_PREFIX = "bladder_threshold_v1:";

function thresholdKey(patientId: string) {
  return `${THRESHOLD_KEY_PREFIX}${patientId || "self"}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function getTypeInfo(key: VoidType) {
  return VOID_TYPES.find((t) => t.key === key) ?? VOID_TYPES[0];
}

function hoursSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 3600000;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function BladderLogScreen() {
  const { params } = useRoute<Route>();
  const patientId = params?.patientId ?? "";
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<BladderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<VoidType>("catheterization");
  const [volumeText, setVolumeText] = useState("");
  const [notes, setNotes] = useState("");

  // Custom high-volume threshold
  const [highVolumeThreshold, setHighVolumeThreshold] = useState(DEFAULT_HIGH_VOLUME_THRESHOLD);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState("");

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(thresholdKey(patientId)).then((raw) => {
      const parsed = raw ? parseInt(raw, 10) : NaN;
      setHighVolumeThreshold(isNaN(parsed) ? DEFAULT_HIGH_VOLUME_THRESHOLD : parsed);
    });
  }, [patientId]));

  const openThresholdModal = () => {
    setThresholdDraft(String(highVolumeThreshold));
    setThresholdModalVisible(true);
  };

  const saveThreshold = async () => {
    const val = parseInt(thresholdDraft, 10);
    if (isNaN(val) || val < 50 || val > 2000) {
      Alert.alert("Invalid", "Enter a value between 50 and 2000 mL.");
      return;
    }
    await AsyncStorage.setItem(thresholdKey(patientId), String(val));
    setHighVolumeThreshold(val);
    setThresholdModalVisible(false);
  };

  const resetThreshold = async () => {
    await AsyncStorage.removeItem(thresholdKey(patientId));
    setHighVolumeThreshold(DEFAULT_HIGH_VOLUME_THRESHOLD);
    setThresholdModalVisible(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/bladder-logs?patientId=${encodeURIComponent(patientId)}`,
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
      const res = await fetch(`${getApiUrl()}/api/health/bladder-logs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId,
          type: selectedType,
          volumeMl: volumeText ? Number(volumeText) : undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save failed", err.message ?? `Server error ${res.status}. Please try again.`);
        return;
      }
      setModalVisible(false);
      resetForm();
      await load();
    } catch (e: any) {
      Alert.alert("Network error", e?.message ?? "Could not reach the server. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete entry", "Remove this bladder log entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/health/bladder-logs/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setEntries((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const resetForm = () => {
    setSelectedType("catheterization");
    setVolumeText("");
    setNotes("");
  };

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------

  const todayEntries = entries.filter((e) => isToday(e.createdAt));
  const totalOutputMl = todayEntries.reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const cathToday = todayEntries.filter((e) => e.type === "catheterization");
  const avgVolume = cathToday.length > 0
    ? Math.round(cathToday.reduce((s, e) => s + (e.volumeMl ?? 0), 0) / cathToday.length)
    : 0;
  const leaksToday = todayEntries.filter((e) => e.type === "leak" || e.type === "accident").length;
  const outputProgress = Math.min(totalOutputMl / DAILY_TARGET_ML, 1);

  const lastCath = entries.find((e) => e.type === "catheterization");
  const hoursSinceLastCath = lastCath ? hoursSince(lastCath.createdAt) : null;
  const cathOverdue = hoursSinceLastCath != null && hoursSinceLastCath >= OVERDUE_HOURS;

  const highVolEntry = todayEntries.find((e) => (e.volumeMl ?? 0) > highVolumeThreshold);

  const isCustomThreshold = highVolumeThreshold !== DEFAULT_HIGH_VOLUME_THRESHOLD;

  // Group all entries by date for history
  const groups: { label: string; items: BladderEntry[] }[] = [];
  for (const entry of entries) {
    const label = formatGroupDate(entry.createdAt);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(entry);
    else groups.push({ label, items: [entry] });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* ── ALERTS ── */}
        {cathOverdue && (
          <View style={[styles.alertBanner, { backgroundColor: "#f97316" }]}>
            <Feather name="clock" size={16} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.alertTitle}>Catheterization May Be Overdue</ThemedText>
              <ThemedText style={styles.alertBody}>
                {Math.floor(hoursSinceLastCath!)}h {Math.round((hoursSinceLastCath! % 1) * 60)}m since last catheterization. Target: every 4–6 hours.
              </ThemedText>
            </View>
          </View>
        )}
        {highVolEntry && (
          <View style={[styles.alertBanner, { backgroundColor: "#ef4444" }]}>
            <Feather name="alert-triangle" size={16} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.alertTitle}>High Volume — Overdistension Risk</ThemedText>
              <ThemedText style={styles.alertBody}>
                {highVolEntry.volumeMl} mL recorded at {formatTime(highVolEntry.createdAt)}. Volume &gt;{highVolumeThreshold} mL increases AD risk.
              </ThemedText>
            </View>
          </View>
        )}

        {/* ── DAILY SUMMARY ── */}
        <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
          <View style={styles.summaryHeader}>
            <View>
              <ThemedText style={styles.summaryTitle}>BLADDER DIARY</ThemedText>
              <ThemedText style={styles.summaryDate}>
                {new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" })}
              </ThemedText>
            </View>
            <View style={[styles.summaryBadge, { backgroundColor: "#FFFFFF" }]}>
              <Feather name="droplet" size={14} color={theme.primary} />
              <ThemedText style={[styles.summaryBadgeText, { color: theme.primary }]}>LOG</ThemedText>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatTile label="Total Output" value={`${totalOutputMl}`} unit="mL" highlight />
            <StatTile label="Catheters" value={`${cathToday.length}`} unit="today" />
            <StatTile label="Avg Volume" value={avgVolume > 0 ? `${avgVolume}` : "—"} unit="mL" />
            <StatTile label="Leaks" value={`${leaksToday}`} unit={leaksToday !== 1 ? "events" : "event"} warn={leaksToday > 0} />
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <ThemedText style={styles.progressLabel}>Daily Output</ThemedText>
              <ThemedText style={styles.progressLabel}>{totalOutputMl} / {DAILY_TARGET_ML} mL</ThemedText>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${outputProgress * 100}%`, backgroundColor: outputProgress >= 1 ? "#22c55e" : "#FFFFFF" },
                ]}
              />
            </View>
            {outputProgress >= 1 && (
              <ThemedText style={styles.progressGoalText}>Daily target reached</ThemedText>
            )}
          </View>
        </View>

        {/* ── ALERT THRESHOLD SETTING ── */}
        <Pressable
          onPress={openThresholdModal}
          style={[styles.thresholdRow, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={[styles.thresholdDot, { backgroundColor: "#ef4444" }]} />
          <ThemedText style={[styles.thresholdLabel, { color: theme.textSecondary }]}>
            High volume alert:{" "}
            <ThemedText style={{ fontWeight: "700", color: theme.text }}>
              {highVolumeThreshold} mL
            </ThemedText>
            {isCustomThreshold && (
              <ThemedText style={{ color: theme.primary }}> (custom)</ThemedText>
            )}
          </ThemedText>
          <Feather name="edit-2" size={13} color={theme.primary} />
        </Pressable>

        {/* ── ENTRY TIMELINE ── */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="droplet" size={40} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center", opacity: 0.6 }}>
              No entries yet.{"\n"}Tap "Log Entry" to start your diary.
            </ThemedText>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
                <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>{group.label.toUpperCase()}</ThemedText>
              </View>

              <View style={styles.timeline}>
                {group.items.map((entry, i) => {
                  const info = getTypeInfo(entry.type);
                  const isLast = i === group.items.length - 1;
                  const highVol = (entry.volumeMl ?? 0) > highVolumeThreshold;
                  return (
                    <View key={entry.id} style={styles.timelineRow}>
                      <View style={styles.timeCol}>
                        <ThemedText style={[styles.timeText, { color: theme.text }]}>
                          {formatTime(entry.createdAt)}
                        </ThemedText>
                      </View>

                      <View style={styles.timelineTrack}>
                        <View style={[styles.timelineDot, { backgroundColor: highVol ? "#ef4444" : info.color }]} />
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border ?? "#E0E0E0" }]} />}
                      </View>

                      <Pressable
                        onLongPress={() => handleDelete(entry.id)}
                        style={[
                          styles.entryCard,
                          { backgroundColor: theme.backgroundDefault },
                          highVol && { borderLeftWidth: 3, borderLeftColor: "#ef4444" },
                        ]}
                      >
                        <View style={styles.entryTop}>
                          <View style={[styles.typeBadge, { backgroundColor: info.color + "20" }]}>
                            <Feather name={info.icon} size={11} color={info.color} />
                            <ThemedText style={[styles.typeBadgeText, { color: info.color }]}>{info.shortLabel}</ThemedText>
                          </View>
                          {entry.volumeMl != null && (
                            <ThemedText style={[styles.volumeText, { color: highVol ? "#ef4444" : theme.text }]}>
                              {entry.volumeMl} mL{highVol ? " ⚠" : ""}
                            </ThemedText>
                          )}
                        </View>
                        <ThemedText style={[styles.entryMeta, { color: theme.textSecondary }]}>
                          {entry.authorName}
                        </ThemedText>
                        {entry.notes ? (
                          <ThemedText style={[styles.entryNotes, { color: theme.textSecondary }]}>{entry.notes}</ThemedText>
                        ) : null}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {entries.length > 0 && (
          <ThemedText style={[styles.holdHint, { color: theme.textSecondary }]}>
            Hold an entry to delete
          </ThemedText>
        )}
      </ScrollView>

      {/* ── LOG ENTRY BUTTON ── */}
      <View style={[styles.addBarContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.addBar, { backgroundColor: theme.primary }]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addBarText}>Log Entry</ThemedText>
        </Pressable>
      </View>

      {/* ── ADD MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Log Bladder Event</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>EVENT TYPE</ThemedText>
            <View style={styles.typeGrid}>
              {VOID_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setSelectedType(t.key)}
                  style={[
                    styles.typeOption,
                    selectedType === t.key
                      ? { backgroundColor: t.color, borderColor: t.color }
                      : { backgroundColor: theme.backgroundDefault, borderColor: theme.border ?? "#E0E0E0" },
                  ]}
                >
                  <Feather name={t.icon} size={18} color={selectedType === t.key ? "#FFFFFF" : t.color} />
                  <ThemedText style={[styles.typeOptionText, { color: selectedType === t.key ? "#FFFFFF" : theme.text }]}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>VOLUME (mL)</ThemedText>

            <View style={styles.quickRow}>
              {QUICK_VOLUMES.map((v) => {
                const isHigh = v > highVolumeThreshold;
                return (
                  <Pressable
                    key={v}
                    onPress={() => setVolumeText(String(v))}
                    style={[
                      styles.quickVolumeBtn,
                      volumeText === String(v)
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: theme.backgroundDefault },
                      isHigh && { borderWidth: 1, borderColor: "#ef444440" },
                    ]}
                  >
                    <ThemedText style={{ fontSize: 13, fontWeight: "700", color: volumeText === String(v) ? "#FFFFFF" : theme.text }}>
                      {v}
                    </ThemedText>
                    {isHigh && (
                      <ThemedText style={{ fontSize: 9, color: volumeText === String(v) ? "rgba(255,255,255,0.8)" : "#ef4444" }}>⚠ high</ThemedText>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={volumeText}
              onChangeText={setVolumeText}
              placeholder="Or type custom amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              style={[styles.volumeInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />
            {volumeText && Number(volumeText) > highVolumeThreshold && (
              <View style={styles.highVolWarning}>
                <Feather name="alert-triangle" size={13} color="#ef4444" />
                <ThemedText style={{ fontSize: 12, color: "#ef4444" }}>
                  {Number(volumeText)} mL exceeds your {highVolumeThreshold} mL threshold — overdistension and AD risk. Review catheterization schedule.
                </ThemedText>
              </View>
            )}

            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>NOTES (OPTIONAL)</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. colour, odour, symptoms..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <Button onPress={handleSave} disabled={saving} style={styles.saveButton}>
              {saving ? "Saving…" : "Add to Diary"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>

      {/* ── THRESHOLD MODAL ── */}
      <Modal visible={thresholdModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setThresholdModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">High Volume Alert</ThemedText>
            <Pressable onPress={() => setThresholdModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19, marginBottom: Spacing.lg }}>
              Set the single-void volume that triggers a high-volume alert. The Consortium for Spinal Cord Medicine guidelines recommend 400–500 mL as the upper safe limit, but your usual capacity may differ. Overnight drainage bags often exceed this — set a threshold that suits your routine.
            </ThemedText>

            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>ALERT THRESHOLD (mL)</ThemedText>
            <TextInput
              value={thresholdDraft}
              onChangeText={setThresholdDraft}
              keyboardType="number-pad"
              placeholder="500"
              placeholderTextColor={theme.textSecondary}
              style={[styles.volumeInput, { backgroundColor: theme.backgroundDefault, color: theme.text, marginBottom: Spacing.sm }]}
            />
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Accepted range: 50–2000 mL. Default: {DEFAULT_HIGH_VOLUME_THRESHOLD} mL.
            </ThemedText>

            <Button onPress={saveThreshold} style={styles.saveButton}>Save threshold</Button>

            {isCustomThreshold && (
              <Pressable onPress={resetThreshold} style={{ alignItems: "center", paddingVertical: Spacing.md }}>
                <ThemedText style={{ color: theme.error, fontSize: 14, fontWeight: "600" }}>Reset to default ({DEFAULT_HIGH_VOLUME_THRESHOLD} mL)</ThemedText>
              </Pressable>
            )}
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: summary stat tile
// ---------------------------------------------------------------------------

function StatTile({ label, value, unit, highlight, warn }: { label: string; value: string; unit: string; highlight?: boolean; warn?: boolean }) {
  return (
    <View style={statStyles.tile}>
      <ThemedText style={[statStyles.value, warn && { color: "#f97316" }]}>{value}</ThemedText>
      <ThemedText style={statStyles.unit}>{unit}</ThemedText>
      <ThemedText style={statStyles.label}>{label}</ThemedText>
    </View>
  );
}

const statStyles = StyleSheet.create({
  tile: { flex: 1, alignItems: "center", gap: 2 },
  value: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", lineHeight: 26 },
  unit: { fontSize: 10, color: "rgba(255,255,255,0.7)" },
  label: { fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "center" },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* alerts */
  alertBanner: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, padding: Spacing.md, margin: Spacing.lg, marginBottom: 0, borderRadius: BorderRadius.medium },
  alertTitle: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  alertBody: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2, lineHeight: 16 },

  /* summary card */
  summaryCard: { margin: Spacing.lg, borderRadius: BorderRadius.large, padding: Spacing.lg, gap: Spacing.md },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryTitle: { fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 },
  summaryDate: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", marginTop: 2 },
  summaryBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  summaryBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", gap: Spacing.sm },
  progressSection: { gap: 6 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressGoalText: { fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: "700" },

  /* threshold row */
  thresholdRow: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: Spacing.lg, marginTop: Spacing.sm, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.medium },
  thresholdDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  thresholdLabel: { flex: 1, fontSize: 12 },

  /* section */
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.sm },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  /* timeline */
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, minHeight: 64 },
  timeCol: { width: 68, paddingTop: 10, alignItems: "flex-end" },
  timeText: { fontSize: 13, fontWeight: "600" },
  timelineTrack: { width: 20, alignItems: "center", paddingTop: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  entryCard: { flex: 1, borderRadius: BorderRadius.medium, padding: Spacing.sm, marginBottom: Spacing.sm, gap: 3 },
  entryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  volumeText: { fontSize: 18, fontWeight: "800" },
  entryMeta: { fontSize: 11 },
  entryNotes: { fontSize: 12, fontStyle: "italic" },
  holdHint: { textAlign: "center", fontSize: 11, opacity: 0.4, paddingBottom: Spacing.md },

  /* empty */
  emptyContainer: { alignItems: "center", paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },

  /* add bar */
  addBarContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.08)" },
  addBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, height: 52, borderRadius: 14 },
  addBarText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  /* modal */
  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  typeOption: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.medium, borderWidth: 1.5, flex: 1, minWidth: "45%" },
  typeOptionText: { fontSize: 14, fontWeight: "600" },
  quickRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  quickVolumeBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: BorderRadius.medium, gap: 2 },
  volumeInput: { height: 52, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: Spacing.sm },
  highVolWarning: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#ef444414", borderRadius: BorderRadius.small, padding: Spacing.sm, marginBottom: Spacing.sm },
  notesInput: { height: 90, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 15, textAlignVertical: "top", marginBottom: Spacing.md },
  saveButton: { marginTop: Spacing.sm },
});
