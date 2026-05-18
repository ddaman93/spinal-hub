import React, { useState, useCallback } from "react";
import {
  View, ScrollView, StyleSheet, Pressable, TextInput, Modal,
  ActivityIndicator, Alert,
} from "react-native";
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

type Route = RouteProp<MainStackParamList, "BowelLog">;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type BowelMethod =
  | "digital_stimulation"
  | "suppository"
  | "enema"
  | "manual_evacuation"
  | "spontaneous"
  | "laxative"
  | "no_result";

const METHODS: { key: BowelMethod; label: string; icon: React.ComponentProps<typeof Feather>["name"]; color: string }[] = [
  { key: "digital_stimulation", label: "Digital Stimulation",  icon: "zap",          color: "#007AFF" },
  { key: "suppository",         label: "Suppository",           icon: "package",      color: "#8B5CF6" },
  { key: "enema",               label: "Enema",                 icon: "droplet",      color: "#06B6D4" },
  { key: "manual_evacuation",   label: "Manual Evacuation",     icon: "edit-2",       color: "#f97316" },
  { key: "spontaneous",         label: "Spontaneous / Reflex",  icon: "check-circle", color: "#22c55e" },
  { key: "laxative",            label: "Oral Laxative",         icon: "pill" as any,  color: "#EC4899" },
  { key: "no_result",           label: "No Result",             icon: "x-circle",     color: "#6B7280" },
];

// Bristol Stool Scale types
const BRISTOL_TYPES: { type: number; label: string; description: string; color: string }[] = [
  { type: 1, label: "Type 1", description: "Separate hard lumps (like nuts)", color: "#8B4513" },
  { type: 2, label: "Type 2", description: "Lumpy sausage shape",              color: "#A0522D" },
  { type: 3, label: "Type 3", description: "Sausage with cracks on surface",   color: "#CD853F" },
  { type: 4, label: "Type 4", description: "Smooth, soft sausage",             color: "#22c55e" },
  { type: 5, label: "Type 5", description: "Soft blobs with clear edges",      color: "#f97316" },
  { type: 6, label: "Type 6", description: "Fluffy, mushy with ragged edges",  color: "#ef4444" },
  { type: 7, label: "Type 7", description: "Watery, no solid pieces",          color: "#DC2626" },
];

const AMOUNTS = [
  { key: "small",    label: "Small",    icon: "•" },
  { key: "moderate", label: "Moderate", icon: "••" },
  { key: "large",    label: "Large",    icon: "•••" },
  { key: "none",     label: "None",     icon: "—" },
];

const COLOURS = [
  { key: "normal",  label: "Brown (normal)", dot: "#8B4513" },
  { key: "dark",    label: "Dark / Black",   dot: "#1a1a1a" },
  { key: "pale",    label: "Pale / Yellow",  dot: "#DEB887" },
  { key: "bloody",  label: "Bloody / Red",   dot: "#DC2626" },
  { key: "mucus",   label: "Mucus",          dot: "#6B8E23" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatGroupDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function bristolInfo(type: number | null) {
  return BRISTOL_TYPES.find((b) => b.type === type) ?? null;
}

function methodInfo(key: BowelMethod) {
  return METHODS.find((m) => m.key === key) ?? METHODS[0];
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

type BowelEntry = {
  id: string;
  method: BowelMethod;
  bristolType: number | null;
  amount: string | null;
  colour: string | null;
  durationMins: number | null;
  notes: string | null;
  authorName: string;
  createdAt: string;
};

export default function BowelLogScreen() {
  const { params } = useRoute<Route>();
  const patientId = params?.patientId ?? "";
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [entries, setEntries] = useState<BowelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [method, setMethod] = useState<BowelMethod>("digital_stimulation");
  const [bristolType, setBristolType] = useState<number | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [colour, setColour] = useState<string | null>(null);
  const [durationText, setDurationText] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/bowel-logs?patientId=${encodeURIComponent(patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setEntries(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function resetForm() {
    setMethod("digital_stimulation");
    setBristolType(null);
    setAmount(null);
    setColour(null);
    setDurationText("");
    setNotes("");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/bowel-logs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          method,
          bristolType,
          amount,
          colour,
          durationMins: durationText ? parseInt(durationText, 10) : null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save failed", err.message ?? `Server error ${res.status}.`);
        return;
      }
      setModalVisible(false);
      resetForm();
      await load();
    } catch (e: any) {
      Alert.alert("Network error", e?.message ?? "Could not reach server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete entry", "Remove this bowel log entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/health/bowel-logs/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setEntries((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  }

  // ---------------------------------------------------------------------------
  // Derived stats (today)
  // ---------------------------------------------------------------------------

  const todayEntries = entries.filter((e) => isToday(e.createdAt));
  const successToday = todayEntries.filter((e) => e.method !== "no_result").length;
  const noResultToday = todayEntries.filter((e) => e.method === "no_result").length;

  const concerningBristol = todayEntries.some(
    (e) => e.bristolType !== null && (e.bristolType <= 2 || e.bristolType >= 6),
  );
  const concerningColour = todayEntries.some(
    (e) => e.colour === "bloody" || e.colour === "dark",
  );

  // Grouped history
  const groups: { label: string; items: BowelEntry[] }[] = [];
  for (const entry of entries) {
    const label = formatGroupDate(entry.createdAt);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(entry);
    else groups.push({ label, items: [entry] });
  }

  const noResult = method === "no_result";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Clinical alerts */}
        {concerningColour && (
          <View style={[styles.alertBanner, { backgroundColor: "#DC2626" }]}>
            <Feather name="alert-triangle" size={16} color="#fff" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.alertTitle}>Blood / Dark Stool — Review Required</ThemedText>
              <ThemedText style={styles.alertBody}>
                Dark or bloody stool today. Notify clinician — may indicate GI bleeding.
              </ThemedText>
            </View>
          </View>
        )}
        {concerningBristol && !concerningColour && (
          <View style={[styles.alertBanner, { backgroundColor: "#f97316" }]}>
            <Feather name="info" size={16} color="#fff" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.alertTitle}>Stool Consistency Outside Normal Range</ThemedText>
              <ThemedText style={styles.alertBody}>
                Type 1–2 may indicate constipation. Type 6–7 may indicate bowel infection or inadequate programme.
              </ThemedText>
            </View>
          </View>
        )}

        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: "#8B5CF6" }]}>
          <View style={styles.summaryHeader}>
            <View>
              <ThemedText style={styles.summaryLabel}>BOWEL DIARY</ThemedText>
              <ThemedText style={styles.summaryDate}>
                {new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" })}
              </ThemedText>
            </View>
            <View style={[styles.summaryBadge, { backgroundColor: "#fff" }]}>
              <ThemedText style={[styles.summaryBadgeText, { color: "#8B5CF6" }]}>LOG</ThemedText>
            </View>
          </View>
          <View style={styles.statsRow}>
            <StatTile label="Successful" value={`${successToday}`} unit="today" />
            <StatTile label="No Result" value={`${noResultToday}`} unit="events" warn={noResultToday > 1} />
            <StatTile label="Total" value={`${todayEntries.length}`} unit="entries" />
          </View>
        </View>

        {/* Entry history */}
        {loading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginTop: Spacing.xl }} />
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="clipboard" size={40} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center", opacity: 0.6 }}>
              No entries yet.{"\n"}Tap "Log Entry" to start your diary.
            </ThemedText>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: "#8B5CF6" }]} />
                <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  {group.label.toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.timeline}>
                {group.items.map((entry, i) => {
                  const info = methodInfo(entry.method);
                  const bristol = bristolInfo(entry.bristolType);
                  const isLast = i === group.items.length - 1;
                  const isAlert = entry.colour === "bloody" || entry.colour === "dark";
                  return (
                    <View key={entry.id} style={styles.timelineRow}>
                      <View style={styles.timeCol}>
                        <ThemedText style={[styles.timeText, { color: theme.text }]}>
                          {formatTime(entry.createdAt)}
                        </ThemedText>
                      </View>
                      <View style={styles.timelineTrack}>
                        <View style={[styles.timelineDot, { backgroundColor: isAlert ? "#DC2626" : info.color }]} />
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.backgroundTertiary }]} />}
                      </View>
                      <Pressable
                        onLongPress={() => handleDelete(entry.id)}
                        style={[
                          styles.entryCard,
                          { backgroundColor: theme.backgroundSecondary },
                          isAlert && { borderLeftWidth: 3, borderLeftColor: "#DC2626" },
                        ]}
                      >
                        <View style={styles.entryTop}>
                          <View style={[styles.methodBadge, { backgroundColor: info.color + "20" }]}>
                            <Feather name={info.icon} size={11} color={info.color} />
                            <ThemedText style={[styles.methodBadgeText, { color: info.color }]}>
                              {info.label}
                            </ThemedText>
                          </View>
                          {bristol && (
                            <View style={[styles.bristolBadge, { backgroundColor: bristol.color + "20", borderColor: bristol.color }]}>
                              <ThemedText style={[styles.bristolBadgeText, { color: bristol.color }]}>
                                BSS {entry.bristolType}
                              </ThemedText>
                            </View>
                          )}
                        </View>

                        {/* Details row */}
                        <View style={styles.detailRow}>
                          {entry.amount && entry.amount !== "none" && (
                            <ThemedText style={[styles.detailChip, { color: theme.textSecondary }]}>
                              {entry.amount.charAt(0).toUpperCase() + entry.amount.slice(1)} amount
                            </ThemedText>
                          )}
                          {entry.colour && (
                            <View style={styles.colourChip}>
                              <View style={[styles.colourDot, { backgroundColor: COLOURS.find((c) => c.key === entry.colour)?.dot ?? "#888" }]} />
                              <ThemedText style={[styles.detailChip, { color: isAlert ? "#DC2626" : theme.textSecondary }]}>
                                {COLOURS.find((c) => c.key === entry.colour)?.label ?? entry.colour}
                              </ThemedText>
                            </View>
                          )}
                          {entry.durationMins != null && (
                            <ThemedText style={[styles.detailChip, { color: theme.textSecondary }]}>
                              {entry.durationMins} min
                            </ThemedText>
                          )}
                        </View>

                        <ThemedText style={[styles.entryMeta, { color: theme.textSecondary }]}>
                          {entry.authorName}
                        </ThemedText>
                        {entry.notes ? (
                          <ThemedText style={[styles.entryNotes, { color: theme.textSecondary }]}>
                            {entry.notes}
                          </ThemedText>
                        ) : null}
                        {bristol && (
                          <ThemedText style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                            {bristol.description}
                          </ThemedText>
                        )}
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

      {/* Log button */}
      <View style={[styles.addBarContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.addBar, { backgroundColor: "#8B5CF6" }]}
        >
          <Feather name="plus" size={20} color="#fff" />
          <ThemedText style={styles.addBarText}>Log Entry</ThemedText>
        </Pressable>
      </View>

      {/* Add modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setModalVisible(false); resetForm(); }}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Log Bowel Event</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: "#8B5CF6" }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>

            {/* Method */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>BOWEL MANAGEMENT METHOD</ThemedText>
            <View style={styles.methodGrid}>
              {METHODS.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  style={[
                    styles.methodOption,
                    method === m.key
                      ? { backgroundColor: m.color, borderColor: m.color }
                      : { backgroundColor: theme.backgroundSecondary, borderColor: theme.backgroundTertiary },
                  ]}
                >
                  <Feather name={m.icon} size={16} color={method === m.key ? "#fff" : m.color} />
                  <ThemedText style={[styles.methodOptionText, { color: method === m.key ? "#fff" : theme.text }]}>
                    {m.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {!noResult && (
              <>
                {/* Bristol Stool Scale */}
                <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>
                  BRISTOL STOOL SCALE
                </ThemedText>
                <View style={styles.bristolGrid}>
                  {BRISTOL_TYPES.map((b) => (
                    <Pressable
                      key={b.type}
                      onPress={() => setBristolType(bristolType === b.type ? null : b.type)}
                      style={[
                        styles.bristolCard,
                        bristolType === b.type
                          ? { backgroundColor: b.color + "22", borderColor: b.color, borderWidth: 2 }
                          : { backgroundColor: theme.backgroundSecondary, borderColor: theme.backgroundTertiary, borderWidth: 1 },
                      ]}
                    >
                      <View style={[styles.bristolNum, { backgroundColor: b.color }]}>
                        <ThemedText style={styles.bristolNumText}>{b.type}</ThemedText>
                      </View>
                      <ThemedText style={{ fontSize: 10, textAlign: "center", opacity: 0.7, marginTop: 4 }}>
                        {b.description}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                {/* Amount */}
                <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>AMOUNT</ThemedText>
                <View style={styles.pillRow}>
                  {AMOUNTS.map((a) => (
                    <Pressable
                      key={a.key}
                      onPress={() => setAmount(amount === a.key ? null : a.key)}
                      style={[
                        styles.pill,
                        amount === a.key
                          ? { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" }
                          : { backgroundColor: theme.backgroundSecondary, borderColor: theme.backgroundTertiary },
                      ]}
                    >
                      <ThemedText style={{ color: amount === a.key ? "#fff" : theme.text, fontWeight: "600", fontSize: 13 }}>
                        {a.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                {/* Colour */}
                <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>COLOUR / CHARACTERISTICS</ThemedText>
                <View style={styles.pillRow}>
                  {COLOURS.map((c) => (
                    <Pressable
                      key={c.key}
                      onPress={() => setColour(colour === c.key ? null : c.key)}
                      style={[
                        styles.colourPill,
                        colour === c.key
                          ? { backgroundColor: c.dot + "33", borderColor: c.dot, borderWidth: 2 }
                          : { backgroundColor: theme.backgroundSecondary, borderColor: theme.backgroundTertiary, borderWidth: 1 },
                      ]}
                    >
                      <View style={[styles.colourDotLarge, { backgroundColor: c.dot }]} />
                      <ThemedText style={{ fontSize: 12, fontWeight: colour === c.key ? "700" : "400", color: theme.text }}>
                        {c.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                {/* Duration */}
                <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>DURATION (MINS)</ThemedText>
                <TextInput
                  value={durationText}
                  onChangeText={setDurationText}
                  placeholder="e.g. 30"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  style={[styles.durationInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                />
              </>
            )}

            {/* Notes */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>NOTES (OPTIONAL)</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. abdominal spasm, autonomic symptoms..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.notesInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            />

            <Button onPress={handleSave} disabled={saving} style={styles.saveButton}>
              {saving ? "Saving…" : "Add to Diary"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatTile({ label, value, unit, warn }: { label: string; value: string; unit: string; warn?: boolean }) {
  return (
    <View style={statStyles.tile}>
      <ThemedText style={[statStyles.value, warn && { color: "#FCD34D" }]}>{value}</ThemedText>
      <ThemedText style={statStyles.unit}>{unit}</ThemedText>
      <ThemedText style={statStyles.label}>{label}</ThemedText>
    </View>
  );
}

const statStyles = StyleSheet.create({
  tile: { flex: 1, alignItems: "center", gap: 2 },
  value: { fontSize: 22, fontWeight: "800", color: "#fff", lineHeight: 26 },
  unit: { fontSize: 10, color: "rgba(255,255,255,0.7)" },
  label: { fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "center" },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  alertBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm,
    padding: Spacing.md, margin: Spacing.lg, marginBottom: 0, borderRadius: BorderRadius.medium,
  },
  alertTitle: { fontSize: 13, fontWeight: "800", color: "#fff" },
  alertBody: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2, lineHeight: 16 },

  summaryCard: { margin: Spacing.lg, borderRadius: BorderRadius.large, padding: Spacing.lg, gap: Spacing.md },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryLabel: { fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 },
  summaryDate: { fontSize: 16, fontWeight: "700", color: "#fff", marginTop: 2 },
  summaryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  summaryBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", gap: Spacing.sm },

  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.sm },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, minHeight: 72 },
  timeCol: { width: 68, paddingTop: 10, alignItems: "flex-end" },
  timeText: { fontSize: 13, fontWeight: "600" },
  timelineTrack: { width: 20, alignItems: "center", paddingTop: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },

  entryCard: { flex: 1, borderRadius: BorderRadius.medium, padding: Spacing.sm, marginBottom: Spacing.sm, gap: 3 },
  entryTop: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  methodBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  methodBadgeText: { fontSize: 11, fontWeight: "700" },
  bristolBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  bristolBadgeText: { fontSize: 11, fontWeight: "700" },
  detailRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  detailChip: { fontSize: 11 },
  colourChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  colourDot: { width: 8, height: 8, borderRadius: 4 },
  entryMeta: { fontSize: 11 },
  entryNotes: { fontSize: 12, fontStyle: "italic" },
  holdHint: { textAlign: "center", fontSize: 11, opacity: 0.4, paddingBottom: Spacing.md },
  emptyContainer: { alignItems: "center", paddingVertical: 60, paddingHorizontal: Spacing.xl },

  addBarContainer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.08)",
  },
  addBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: Spacing.sm, height: 52, borderRadius: 14,
  },
  addBarText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg,
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },

  methodGrid: { gap: Spacing.sm },
  methodOption: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium, borderWidth: 1.5,
  },
  methodOptionText: { fontSize: 14, fontWeight: "600" },

  bristolGrid: { gap: 6 },
  bristolCard: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    padding: Spacing.sm, borderRadius: BorderRadius.small,
  },
  bristolNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bristolNumText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1,
  },
  colourPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  colourDotLarge: { width: 10, height: 10, borderRadius: 5 },

  durationInput: {
    height: 48, borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md, fontSize: 18, fontWeight: "700",
    textAlign: "center", marginBottom: Spacing.sm,
  },
  notesInput: {
    height: 90, borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
    fontSize: 15, textAlignVertical: "top", marginBottom: Spacing.md,
  },
  saveButton: { marginTop: Spacing.sm },
});
