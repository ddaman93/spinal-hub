import React, { useState, useCallback, useMemo } from "react";
import {
  View, ScrollView, StyleSheet, Pressable, TextInput,
  Modal, ActivityIndicator, Alert, Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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

type Route = RouteProp<MainStackParamList, "AppointmentScheduler">;

type Appointment = {
  id: string;
  title: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string;
  location?: string | null;
  notes?: string | null;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type ApptType = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
};

const APPT_TYPES: ApptType[] = [
  { key: "gp",         label: "GP / Doctor",    icon: "user",         color: "#4A90D9" },
  { key: "specialist", label: "Specialist",      icon: "briefcase",    color: "#9C27B0" },
  { key: "physio",     label: "Physio / OT",     icon: "activity",     color: "#22c55e" },
  { key: "equipment",  label: "Equipment",       icon: "tool",         color: "#FF9800" },
  { key: "hospital",   label: "Hospital",        icon: "plus-square",  color: "#ef4444" },
  { key: "other",      label: "Other",           icon: "calendar",     color: "#78909C" },
  // Legacy keys so old records still render
  { key: "doctor",     label: "GP / Doctor",     icon: "user",         color: "#4A90D9" },
  { key: "therapy",    label: "Physio / OT",     icon: "activity",     color: "#22c55e" },
];

// ---------------------------------------------------------------------------
// Date/time helpers
// ---------------------------------------------------------------------------

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function defaultTime(): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  return d;
}

function dateToApiStr(d: Date): string {
  // Use local year/month/day — avoids UTC offset shifting the date
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeToApiStr(d: Date): string {
  return d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTimeDisplay(d: Date): string {
  return d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
}

function getDayNum(dateStr: string): string {
  return String(new Date(dateStr + "T00:00:00").getDate());
}

function getMonthAbbr(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-NZ", { month: "short" }).toUpperCase();
}

function getWeekday(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-NZ", { weekday: "short" }).toUpperCase();
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const appt = new Date(dateStr + "T00:00:00");
  return Math.round((appt.getTime() - today.getTime()) / 86400000);
}

function relativeDateLabel(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 0) return `${Math.abs(d)}d ago`;
  return `In ${d} day${d === 1 ? "" : "s"}`;
}

function groupLabel(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d < 0) return "Past";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d <= 7) return "This Week";
  if (d <= 14) return "Next Week";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-NZ", { month: "long", year: "numeric" });
}

const GROUP_ORDER = ["Today", "Tomorrow", "This Week", "Next Week"];

function getTypeInfo(key: string): ApptType {
  return APPT_TYPES.find((t) => t.key === key) ?? APPT_TYPES[APPT_TYPES.length - 1];
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AppointmentSchedulerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { params } = useRoute<Route>();
  const { patientId } = params;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("gp");
  const [pickerDate, setPickerDate] = useState<Date>(startOfToday);
  const [pickerTime, setPickerTime] = useState<Date>(defaultTime);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // which native picker is open: null | "date" | "time"
  const [pickerMode, setPickerMode] = useState<null | "date" | "time">(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/appointments?patientId=${encodeURIComponent(patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setAppointments(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please add an appointment title."); return; }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/appointments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          title: title.trim(),
          type: selectedType,
          date: dateToApiStr(pickerDate),
          time: timeToApiStr(pickerTime),
          location: location.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save failed", err.message ?? `Error ${res.status}`);
        return;
      }
      await load();
      setModalVisible(false);
      resetForm();
    } catch (e: any) {
      Alert.alert("Network error", e?.message ?? "Could not reach server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, apptTitle: string) => {
    Alert.alert("Remove appointment", `Remove "${apptTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/health/appointments/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setAppointments((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  };

  const resetForm = () => {
    setTitle("");
    setSelectedType("gp");
    setPickerDate(startOfToday());
    setPickerTime(defaultTime());
    setLocation("");
    setNotes("");
    setPickerMode(null);
  };

  // Group appointments
  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const label = groupLabel(a.date);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(a);
    }
    const sorted: { label: string; items: Appointment[] }[] = [];
    for (const key of GROUP_ORDER) {
      if (map.has(key)) sorted.push({ label: key, items: map.get(key)! });
    }
    for (const [key, items] of map) {
      if (!GROUP_ORDER.includes(key)) sorted.push({ label: key, items });
    }
    return sorted;
  }, [appointments]);

  const nextUp = appointments[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* ── NEXT UP BANNER ── */}
        {!loading && nextUp && daysUntil(nextUp.date) >= 0 && daysUntil(nextUp.date) <= 7 && (
          <View style={[styles.nextUpCard, { backgroundColor: getTypeInfo(nextUp.type).color }]}>
            <View style={styles.nextUpLeft}>
              <ThemedText style={styles.nextUpLabel}>NEXT APPOINTMENT</ThemedText>
              <ThemedText style={styles.nextUpTitle}>{nextUp.title}</ThemedText>
              <View style={styles.nextUpDetails}>
                <Feather name="clock" size={13} color="rgba(255,255,255,0.85)" />
                <ThemedText style={styles.nextUpMeta}>{nextUp.time}  ·  {relativeDateLabel(nextUp.date)}</ThemedText>
              </View>
              {nextUp.location ? (
                <View style={styles.nextUpDetails}>
                  <Feather name="map-pin" size={13} color="rgba(255,255,255,0.85)" />
                  <ThemedText style={styles.nextUpMeta}>{nextUp.location}</ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.nextUpDateBox}>
              <ThemedText style={styles.nextUpDay}>{getDayNum(nextUp.date)}</ThemedText>
              <ThemedText style={styles.nextUpMonth}>{getMonthAbbr(nextUp.date)}</ThemedText>
            </View>
          </View>
        )}

        {/* ── APPOINTMENT GROUPS ── */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xxl }} />
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color={theme.textSecondary} style={{ opacity: 0.25 }} />
            <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md, opacity: 0.55 }}>
              No appointments scheduled.{"\n"}Tap "Add Appointment" to get started.
            </ThemedText>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
                <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  {group.label.toUpperCase()}
                </ThemedText>
              </View>

              {group.items.map((appt) => {
                const info = getTypeInfo(appt.type);
                const urgent = daysUntil(appt.date) === 0;
                return (
                  <View
                    key={appt.id}
                    style={[
                      styles.apptCard,
                      { backgroundColor: theme.backgroundDefault },
                      urgent && { borderWidth: 1.5, borderColor: info.color + "60" },
                    ]}
                  >
                    <View style={[styles.apptStrip, { backgroundColor: info.color }]} />
                    <View style={[styles.apptDateCol, { backgroundColor: info.color + "14" }]}>
                      <ThemedText style={[styles.apptWeekday, { color: info.color }]}>{getWeekday(appt.date)}</ThemedText>
                      <ThemedText style={[styles.apptDayNum, { color: info.color }]}>{getDayNum(appt.date)}</ThemedText>
                      <ThemedText style={[styles.apptMonth, { color: info.color }]}>{getMonthAbbr(appt.date)}</ThemedText>
                    </View>
                    <View style={styles.apptContent}>
                      <View style={styles.apptTopRow}>
                        <View style={[styles.typePill, { backgroundColor: info.color + "18" }]}>
                          <Feather name={info.icon} size={11} color={info.color} />
                          <ThemedText style={[styles.typePillText, { color: info.color }]}>{info.label}</ThemedText>
                        </View>
                        {urgent && (
                          <View style={[styles.todayPill, { backgroundColor: info.color }]}>
                            <ThemedText style={styles.todayPillText}>TODAY</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.apptTitle} numberOfLines={2}>{appt.title}</ThemedText>
                      <View style={styles.apptMeta}>
                        <Feather name="clock" size={12} color={theme.textSecondary} />
                        <ThemedText style={[styles.apptMetaText, { color: theme.textSecondary }]}>{appt.time}</ThemedText>
                        {appt.location ? (
                          <>
                            <ThemedText style={{ color: theme.textSecondary, fontSize: 11 }}>·</ThemedText>
                            <Feather name="map-pin" size={12} color={theme.textSecondary} />
                            <ThemedText style={[styles.apptMetaText, { color: theme.textSecondary }]} numberOfLines={1}>{appt.location}</ThemedText>
                          </>
                        ) : null}
                      </View>
                      {appt.notes ? (
                        <ThemedText style={[styles.apptNotes, { color: theme.textSecondary }]} numberOfLines={2}>
                          {appt.notes}
                        </ThemedText>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => handleDelete(appt.id, appt.title)}
                      style={[styles.deleteBtn, { backgroundColor: theme.error + "18" }]}
                    >
                      <Feather name="trash-2" size={15} color={theme.error} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* ── ADD APPOINTMENT BUTTON ── */}
      <View style={[styles.addBarContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.addBar, { backgroundColor: theme.primary }]}
        >
          <Feather name="calendar" size={18} color="#FFFFFF" />
          <ThemedText style={styles.addBarText}>Add Appointment</ThemedText>
        </Pressable>
      </View>

      {/* ── ADD MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">New Appointment</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>

            {/* title */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>APPOINTMENT TITLE</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Dr. Smith annual review"
              placeholderTextColor={theme.textSecondary}
              style={[styles.formInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              autoFocus
            />

            {/* type */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>TYPE</ThemedText>
            <View style={styles.typeGrid}>
              {APPT_TYPES.filter((t) => !["doctor", "therapy"].includes(t.key)).map((t) => (
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
                  <View style={[styles.typeOptionIcon, { backgroundColor: selectedType === t.key ? "rgba(255,255,255,0.25)" : t.color + "20" }]}>
                    <Feather name={t.icon} size={16} color={selectedType === t.key ? "#FFFFFF" : t.color} />
                  </View>
                  <ThemedText style={[styles.typeOptionText, { color: selectedType === t.key ? "#FFFFFF" : theme.text }]}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* date picker row */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>DATE</ThemedText>
            <Pressable
              onPress={() => setPickerMode("date")}
              style={[styles.pickerRow, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="calendar" size={18} color={theme.primary} />
              <ThemedText style={[styles.pickerRowText, { color: theme.text }]}>
                {formatDateDisplay(pickerDate)}
              </ThemedText>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </Pressable>

            {/* time picker row */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>TIME</ThemedText>
            <Pressable
              onPress={() => setPickerMode("time")}
              style={[styles.pickerRow, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="clock" size={18} color={theme.primary} />
              <ThemedText style={[styles.pickerRowText, { color: theme.text }]}>
                {formatTimeDisplay(pickerTime)}
              </ThemedText>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </Pressable>

            {/* location */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>LOCATION (OPTIONAL)</ThemedText>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Burwood Hospital, Room 4"
              placeholderTextColor={theme.textSecondary}
              style={[styles.formInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            {/* notes */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>NOTES (OPTIONAL)</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="What to bring, questions to ask, prep needed..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <Button onPress={handleSave} disabled={saving} style={styles.saveButton}>
              {saving ? "Saving…" : "Save Appointment"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>

      {/* ── NATIVE DATE/TIME PICKER ── */}

      {/* Android: renders as a dialog, no wrapper needed */}
      {Platform.OS === "android" && pickerMode !== null && (
        <DateTimePicker
          value={pickerMode === "date" ? pickerDate : pickerTime}
          mode={pickerMode}
          display="default"
          minimumDate={pickerMode === "date" ? startOfToday() : undefined}
          onChange={(_, selected) => {
            setPickerMode(null);
            if (!selected) return;
            if (pickerMode === "date") setPickerDate(selected);
            else setPickerTime(selected);
          }}
        />
      )}

      {/* iOS: spinner in a bottom sheet modal with Done button */}
      {Platform.OS === "ios" && pickerMode !== null && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setPickerMode(null)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setPickerMode(null)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.pickerSheetHeader}>
                <ThemedText style={[styles.pickerSheetTitle, { color: theme.text }]}>
                  {pickerMode === "date" ? "Select Date" : "Select Time"}
                </ThemedText>
                <Pressable onPress={() => setPickerMode(null)} style={[styles.pickerDoneBtn, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.pickerDoneText}>Done</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerMode === "date" ? pickerDate : pickerTime}
                mode={pickerMode}
                display="spinner"
                minimumDate={pickerMode === "date" ? startOfToday() : undefined}
                onChange={(_, selected) => {
                  if (!selected) return;
                  if (pickerMode === "date") setPickerDate(selected);
                  else setPickerTime(selected);
                }}
                style={styles.nativePicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  nextUpCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    margin: Spacing.lg, borderRadius: BorderRadius.large, padding: Spacing.lg, gap: Spacing.md,
  },
  nextUpLeft: { flex: 1, gap: 4 },
  nextUpLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.2 },
  nextUpTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", lineHeight: 24 },
  nextUpDetails: { flexDirection: "row", alignItems: "center", gap: 5 },
  nextUpMeta: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
  nextUpDateBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minWidth: 56 },
  nextUpDay: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", lineHeight: 34 },
  nextUpMonth: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.85)" },

  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  apptCard: {
    flexDirection: "row", borderRadius: BorderRadius.medium, overflow: "hidden",
    marginBottom: Spacing.sm, alignItems: "stretch",
  },
  apptStrip: { width: 4 },
  apptDateCol: { width: 56, alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, gap: 2 },
  apptWeekday: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  apptDayNum: { fontSize: 26, fontWeight: "900", lineHeight: 28 },
  apptMonth: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  apptContent: { flex: 1, padding: Spacing.sm, gap: 4 },
  apptTopRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flexWrap: "wrap" },
  typePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typePillText: { fontSize: 11, fontWeight: "700" },
  todayPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  todayPillText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  apptTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  apptMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  apptMetaText: { fontSize: 12 },
  apptNotes: { fontSize: 12, fontStyle: "italic", opacity: 0.7 },
  deleteBtn: { width: 44, alignItems: "center", justifyContent: "center" },

  emptyContainer: { alignItems: "center", paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },

  addBarContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.08)" },
  addBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, height: 52, borderRadius: 14 },
  addBarText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  formInput: { height: 52, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 16, marginBottom: 2 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  typeOption: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.medium, borderWidth: 1.5, width: "48%" },
  typeOptionIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  typeOptionText: { fontSize: 13, fontWeight: "600", flex: 1 },
  notesInput: { height: 90, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 15, textAlignVertical: "top", marginBottom: Spacing.md },
  saveButton: { marginTop: Spacing.sm },

  /* picker rows */
  pickerRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    height: 52, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md,
  },
  pickerRowText: { flex: 1, fontSize: 16 },

  /* iOS picker sheet */
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 },
  pickerSheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  pickerSheetTitle: { fontSize: 17, fontWeight: "700" },
  pickerDoneBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 10 },
  pickerDoneText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  nativePicker: { width: "100%" },
});
