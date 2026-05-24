import React, { useState, useCallback, useMemo } from "react";
import {
  View, ScrollView, StyleSheet, Pressable, TextInput, Modal,
  ActivityIndicator, Alert, Dimensions,
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
import { SCI_MEDICATIONS } from "@/data/sciMedications";

type Route = RouteProp<MainStackParamList, "MedicationTracker">;

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string; // comma-separated
  scheduleType: "scheduled" | "prn";
  route: string;
  notes?: string | null;
};

type MedLog = {
  id: string;
  medicationId: string;
  scheduledTime: string;
  taken: boolean;
  actualTime?: string | null;
  administeredByName?: string | null;
  reasonOmitted?: string | null;
};

const ROUTES = [
  { key: "oral",       label: "Oral" },
  { key: "sublingual", label: "Sublingual" },
  { key: "patch",      label: "Patch" },
  { key: "injection",  label: "Injection" },
  { key: "inhaled",    label: "Inhaled" },
  { key: "topical",    label: "Topical" },
  { key: "rectal",     label: "Rectal" },
  { key: "other",      label: "Other" },
];

const OMIT_REASONS = [
  { key: "refused",           label: "Patient Refused" },
  { key: "unavailable",       label: "Unavailable" },
  { key: "sleeping",          label: "Patient Sleeping" },
  { key: "held_by_clinician", label: "Held by Clinician" },
  { key: "npo",               label: "NPO / Fasting" },
  { key: "other",             label: "Other" },
];

const QUICK_TIMES = ["6:00 AM", "8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", "10:00 PM"];
const SLOT_LABELS = ["Time 1", "Time 2", "Time 3", "Time 4"];
const SLOT_WIDTH = (Dimensions.get("window").width - 48 - 24) / 4; // 4 cols, 24px side padding each, 8px*3 gaps

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatChartDate(): string {
  return new Date().toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export default function MedicationTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { params } = useRoute<Route>();
  const patientId = params?.patientId ?? "";
  const patientName = params?.patientName ?? "";

  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dosage, setDosage] = useState("");
  const [scheduleType, setScheduleType] = useState<"scheduled" | "prn">("scheduled");
  const [route, setRoute] = useState("oral");
  const [slots, setSlots] = useState(["", "", "", ""]); // up to 4 time slots
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  // omit reason modal
  const [omitModalVisible, setOmitModalVisible] = useState(false);
  const [pendingOmit, setPendingOmit] = useState<{ medication: Medication; scheduledTime: string } | null>(null);

  const today = todayStr();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const pid = encodeURIComponent(patientId);
      const [medsRes, logsRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/health/medications?patientId=${pid}`, { headers }),
        fetch(`${getApiUrl()}/api/health/medication-logs?patientId=${pid}&date=${today}`, { headers }),
      ]);
      if (medsRes.ok) setMedications(await medsRes.json());
      if (logsRes.ok) setTodayLogs(await logsRes.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [patientId, today]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 2) return [];
    const lower = name.toLowerCase();
    return SCI_MEDICATIONS.filter((m) => m.name.toLowerCase().includes(lower)).map((m) => m.name).slice(0, 6);
  }, [name]);

  const handleSave = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert("Missing info", "Please enter a medication name and dose.");
      return;
    }
    const filledSlots = slots.filter((s) => s.trim());
    if (scheduleType === "scheduled" && filledSlots.length === 0) {
      Alert.alert("Missing times", "Add at least one time.");
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const times = scheduleType === "prn" ? "PRN" : filledSlots.join(", ");
      const frequency = scheduleType === "prn" ? "PRN" : filledSlots.length === 1 ? "Once daily" : filledSlots.length === 2 ? "Twice daily" : filledSlots.length === 3 ? "Three times daily" : "Four times daily";
      const res = await fetch(`${getApiUrl()}/api/health/medications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, name: name.trim(), dosage: dosage.trim(), frequency, times, scheduleType, route }),
      });
      if (res.ok) {
        await loadData();
        setModalVisible(false);
        resetForm();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, medName: string) => {
    Alert.alert("Remove medication", `Remove ${medName} from the chart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/health/medications/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setMedications((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  const doToggleTaken = async (medication: Medication, scheduledTime: string, taken: boolean, reasonOmitted?: string) => {
    const token = await getToken();
    const res = await fetch(`${getApiUrl()}/api/health/medication-logs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        medicationId: medication.id,
        patientId,
        date: today,
        scheduledTime,
        taken,
        actualTime: taken ? new Date().toISOString() : null,
        reasonOmitted: taken ? null : (reasonOmitted ?? null),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodayLogs((prev) => {
        const without = prev.filter((l) => !(l.medicationId === medication.id && l.scheduledTime === scheduledTime));
        return [...without, updated];
      });
    }
  };

  const handleToggleTaken = (medication: Medication, scheduledTime: string) => {
    const existing = todayLogs.find((l) => l.medicationId === medication.id && l.scheduledTime === scheduledTime);
    const willBeTaken = !existing?.taken;
    if (willBeTaken) {
      doToggleTaken(medication, scheduledTime, true);
    } else {
      // marking as not given — ask for reason
      setPendingOmit({ medication, scheduledTime });
      setOmitModalVisible(true);
    }
  };

  const handleOmitConfirm = (reason: string) => {
    if (!pendingOmit) return;
    setOmitModalVisible(false);
    doToggleTaken(pendingOmit.medication, pendingOmit.scheduledTime, false, reason);
    setPendingOmit(null);
  };

  const isTaken = (medicationId: string, time: string) =>
    todayLogs.some((l) => l.medicationId === medicationId && l.scheduledTime === time && l.taken);

  const resetForm = () => {
    setName("");
    setDosage("");
    setScheduleType("scheduled");
    setRoute("oral");
    setSlots(["", "", "", ""]);
    setActiveSlot(null);
    setShowSuggestions(false);
  };

  const setSlot = (index: number, value: string) => {
    setSlots((prev) => { const next = [...prev]; next[index] = value; return next; });
  };

  const scheduledMeds = medications.filter((m) => m.scheduleType !== "prn");
  const prnMeds = medications.filter((m) => m.scheduleType === "prn");
  const totalDoses = scheduledMeds.reduce((sum, m) => sum + m.times.split(",").filter(Boolean).length, 0);
  const takenToday = todayLogs.filter((l) => l.taken).length;
  const omittedToday = todayLogs.filter((l) => !l.taken && l.reasonOmitted).length;
  const prnGivenToday = prnMeds.reduce((sum, m) => sum + todayLogs.filter((l) => l.medicationId === m.id && l.taken).length, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* ── CHART HEADER ── */}
        <View style={[styles.chartHeader, { backgroundColor: theme.primary }]}>
          <View style={styles.chartHeaderTop}>
            <View>
              <ThemedText style={styles.chartTitle}>MEDICATION CHART</ThemedText>
              <ThemedText style={styles.chartPatient}>{patientName}</ThemedText>
            </View>
            <View style={styles.chartBadge}>
              <Feather name="shield" size={14} color={theme.primary} />
              <ThemedText style={[styles.chartBadgeText, { color: theme.primary }]}>CHART</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.chartDate}>{formatChartDate()}</ThemedText>

          {medications.length > 0 && (
            <View style={styles.chartProgress}>
              <View style={styles.chartProgressBar}>
                <View style={[styles.chartProgressFill, { width: `${totalDoses > 0 ? (takenToday / totalDoses) * 100 : 0}%` }]} />
              </View>
              <ThemedText style={styles.chartProgressText}>
                {takenToday}/{totalDoses} doses given today
              </ThemedText>
            </View>
          )}
        </View>

        {/* ── MED ROWS ── */}
        <View style={styles.chartBody}>
          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
          ) : medications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={40} color={theme.textSecondary} style={{ opacity: 0.4 }} />
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md, opacity: 0.6 }}>
                No medications on this chart.{"\n"}Tap "Add to Chart" to get started.
              </ThemedText>
            </View>
          ) : (
            medications.map((med, index) => {
              const isPrn = med.scheduleType === "prn";
              const timeList = isPrn ? ["PRN"] : med.times.split(",").map((t) => t.trim()).filter(Boolean);
              return (
                <View
                  key={med.id}
                  style={[
                    styles.medRow,
                    { backgroundColor: theme.backgroundDefault },
                    index < medications.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border ?? "#E0E0E0" },
                  ]}
                >
                  {/* left: name + dose */}
                  <View style={styles.medLeft}>
                    <ThemedText style={styles.medName} numberOfLines={2}>{med.name}</ThemedText>
                    <ThemedText style={[styles.medDose, { color: theme.textSecondary }]}>{med.dosage}</ThemedText>
                    <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                      {isPrn && (
                        <View style={styles.prnBadge}>
                          <ThemedText style={styles.prnBadgeText}>PRN</ThemedText>
                        </View>
                      )}
                      <ThemedText style={[styles.medFreq, { color: theme.textSecondary }]}>
                        {ROUTES.find((r) => r.key === med.route)?.label ?? med.route}
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={() => handleDelete(med.id, med.name)}
                      style={[styles.removeBtn, { borderColor: theme.error + "40" }]}
                    >
                      <Feather name="trash-2" size={12} color={theme.error} />
                      <ThemedText style={{ fontSize: 11, color: theme.error, marginLeft: 3 }}>Remove</ThemedText>
                    </Pressable>
                  </View>

                  {/* right: time boxes */}
                  <View style={styles.medRight}>
                    {(isPrn ? [0] : [0, 1, 2, 3]).map((i) => {
                      const time = timeList[i];
                      const log = time ? todayLogs.find((l) => l.medicationId === med.id && l.scheduledTime === time) : null;
                      const taken = log?.taken ?? false;
                      const omitted = log && !log.taken && log.reasonOmitted;
                      return (
                        <Pressable
                          key={i}
                          onPress={() => time ? handleToggleTaken(med, time) : undefined}
                          disabled={!time}
                          style={[
                            styles.doseBox,
                            isPrn && { width: "auto", minWidth: 64, flex: 0, paddingHorizontal: 10 },
                            time
                              ? taken
                                ? { backgroundColor: "#22c55e" }
                                : omitted
                                  ? { backgroundColor: "#ef444422", borderWidth: 1.5, borderColor: "#ef4444" }
                                  : { backgroundColor: theme.backgroundSecondary ?? theme.backgroundDefault, borderWidth: 1.5, borderColor: theme.border ?? "#E0E0E0" }
                              : { backgroundColor: "transparent", borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border ?? "#E0E0E0", opacity: 0.3 },
                          ]}
                        >
                          {time ? (
                            <>
                              <Feather
                                name={taken ? "check" : omitted ? "x" : "circle"}
                                size={16}
                                color={taken ? "#FFFFFF" : omitted ? "#ef4444" : theme.textSecondary}
                              />
                              <ThemedText
                                style={[
                                  styles.doseTime,
                                  { color: taken ? "#FFFFFF" : omitted ? "#ef4444" : theme.textSecondary },
                                ]}
                                numberOfLines={2}
                              >
                                {isPrn ? "Log PRN" : time}
                              </ThemedText>
                              {taken && log?.administeredByName ? (
                                <ThemedText style={styles.doseAdmin} numberOfLines={1}>
                                  {log.administeredByName.split(" ")[0]}
                                </ThemedText>
                              ) : null}
                              {taken && log?.actualTime ? (
                                <ThemedText style={styles.doseActualTime} numberOfLines={1}>
                                  {new Date(log.actualTime).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </ThemedText>
                              ) : null}
                            </>
                          ) : (
                            <ThemedText style={{ fontSize: 9, color: theme.textSecondary }}>—</ThemedText>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* column headers below chart body */}
        {scheduledMeds.length > 0 && (
          <View style={[styles.columnLabels, { paddingHorizontal: Spacing.lg }]}>
            <View style={{ width: 120 }} />
            {["Dose 1", "Dose 2", "Dose 3", "Dose 4"].map((l) => (
              <ThemedText key={l} style={[styles.colLabel, { color: theme.textSecondary }]}>{l}</ThemedText>
            ))}
          </View>
        )}

        {/* omitted / PRN summary */}
        {(omittedToday > 0 || prnGivenToday > 0) && (
          <View style={[styles.marSummary, { backgroundColor: theme.backgroundSecondary ?? theme.backgroundDefault }]}>
            {omittedToday > 0 && (
              <View style={styles.marSummaryRow}>
                <View style={[styles.marDot, { backgroundColor: "#ef4444" }]} />
                <ThemedText style={{ fontSize: 12, color: theme.text }}>
                  {omittedToday} dose{omittedToday !== 1 ? "s" : ""} not given today — reason recorded
                </ThemedText>
              </View>
            )}
            {prnGivenToday > 0 && (
              <View style={styles.marSummaryRow}>
                <View style={[styles.marDot, { backgroundColor: "#f97316" }]} />
                <ThemedText style={{ fontSize: 12, color: theme.text }}>
                  {prnGivenToday} PRN dose{prnGivenToday !== 1 ? "s" : ""} administered today
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── ADD TO CHART BUTTON ── */}
      <View style={[styles.addBarContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.addBar, { backgroundColor: theme.primary }]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addBarText}>Add to Chart</ThemedText>
        </Pressable>
      </View>

      {/* ── ADD MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Add Medication</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {/* name */}
            <ThemedText type="small" style={[styles.formLabel, { color: theme.textSecondary }]}>MEDICATION NAME</ThemedText>
            <TextInput
              value={name}
              onChangeText={(text) => { setName(text); setShowSuggestions(true); }}
              placeholder="e.g. Baclofen"
              placeholderTextColor={theme.textSecondary}
              style={[styles.formInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              autoCorrect={false}
            />
            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestionList, { backgroundColor: theme.backgroundDefault, borderColor: theme.primary + "40" }]}>
                {suggestions.map((s) => (
                  <Pressable key={s} onPress={() => { setName(s); setShowSuggestions(false); }} style={[styles.suggestionItem, { borderBottomColor: theme.border ?? "#E0E0E0" }]}>
                    <ThemedText type="body">{s}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

            {/* dose */}
            <ThemedText type="small" style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>DOSE</ThemedText>
            <TextInput
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g. 10mg"
              placeholderTextColor={theme.textSecondary}
              style={[styles.formInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            {/* schedule type */}
            <ThemedText type="small" style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>SCHEDULE TYPE</ThemedText>
            <View style={styles.segmentRow}>
              {(["scheduled", "prn"] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setScheduleType(s)}
                  style={[styles.segment, scheduleType === s && { backgroundColor: theme.primary }]}
                >
                  <ThemedText style={{ fontSize: 13, fontWeight: "700", color: scheduleType === s ? "#fff" : theme.text }}>
                    {s === "scheduled" ? "Scheduled" : "PRN (as needed)"}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* route */}
            <ThemedText type="small" style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>ROUTE</ThemedText>
            <View style={styles.routePills}>
              {ROUTES.map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => setRoute(r.key)}
                  style={[styles.routePill, route === r.key && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                >
                  <ThemedText style={{ fontSize: 12, fontWeight: "600", color: route === r.key ? "#fff" : theme.text }}>
                    {r.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* time slots — only for scheduled */}
            {scheduleType === "scheduled" && (
              <>
                <ThemedText type="small" style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>TIMES (UP TO 4 PER DAY)</ThemedText>
                {SLOT_LABELS.map((label, i) => (
                  <View key={i} style={styles.slotRow}>
                    <View style={[styles.slotNumBadge, { backgroundColor: slots[i] ? theme.primary + "22" : theme.backgroundDefault }]}>
                      <ThemedText style={{ fontSize: 11, fontWeight: "700", color: slots[i] ? theme.primary : theme.textSecondary }}>{i + 1}</ThemedText>
                    </View>
                    <TextInput
                      value={slots[i]}
                      onChangeText={(v) => setSlot(i, v)}
                      onFocus={() => setActiveSlot(i)}
                      onBlur={() => setActiveSlot(null)}
                      placeholder={label}
                      placeholderTextColor={theme.textSecondary}
                      style={[
                        styles.slotInput,
                        { backgroundColor: theme.backgroundDefault, color: theme.text },
                        activeSlot === i && { borderWidth: 1.5, borderColor: theme.primary },
                      ]}
                    />
                    {slots[i] ? (
                      <Pressable onPress={() => setSlot(i, "")} style={{ padding: 8 }}>
                        <Feather name="x" size={16} color={theme.textSecondary} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
                <ThemedText type="small" style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.md }]}>
                  QUICK PICK {activeSlot !== null ? `→ SLOT ${activeSlot + 1}` : "(tap a slot first)"}
                </ThemedText>
                <View style={styles.quickPicks}>
                  {QUICK_TIMES.map((t) => {
                    const inUse = slots.includes(t);
                    return (
                      <Pressable
                        key={t}
                        onPress={() => {
                          const target = activeSlot !== null ? activeSlot : slots.findIndex((s) => !s);
                          if (target !== -1) { setSlot(target, t); }
                        }}
                        style={[
                          styles.quickPickBtn,
                          { backgroundColor: inUse ? theme.primary : theme.backgroundDefault },
                        ]}
                        disabled={inUse}
                      >
                        <ThemedText style={{ fontSize: 12, color: inUse ? "#FFFFFF" : theme.text }}>{t}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Button onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? "Adding…" : "Add to Chart"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>

      {/* ── OMIT REASON MODAL ── */}
      <Modal
        visible={omitModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => { setOmitModalVisible(false); setPendingOmit(null); }}
      >
        <View style={[styles.omitModalContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Reason Not Given</ThemedText>
            <Pressable onPress={() => { setOmitModalVisible(false); setPendingOmit(null); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>
          <ThemedText type="caption" style={{ paddingHorizontal: Spacing.xl, opacity: 0.6, marginBottom: Spacing.lg }}>
            {pendingOmit?.medication.name} — {pendingOmit?.scheduledTime}
          </ThemedText>
          {OMIT_REASONS.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => handleOmitConfirm(r.key)}
              style={[styles.omitOption, { borderBottomColor: theme.backgroundTertiary }]}
            >
              <ThemedText type="body" style={{ fontWeight: "500" }}>{r.label}</ThemedText>
              <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* chart header */
  chartHeader: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  chartHeaderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  chartTitle: { fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 },
  chartPatient: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  chartDate: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: Spacing.md },
  chartBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 4 },
  chartBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  chartProgress: { gap: 6 },
  chartProgressBar: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  chartProgressFill: { height: "100%", borderRadius: 3, backgroundColor: "#FFFFFF" },
  chartProgressText: { fontSize: 12, color: "rgba(255,255,255,0.8)" },

  /* chart body */
  chartBody: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: BorderRadius.medium, overflow: "hidden" },
  medRow: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
    minHeight: 100,
  },
  medLeft: { width: 120, gap: 3, paddingRight: Spacing.sm },
  medName: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  medDose: { fontSize: 13, fontWeight: "600" },
  medFreq: { fontSize: 11, opacity: 0.7 },
  removeBtn: { flexDirection: "row", alignItems: "center", marginTop: 6, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignSelf: "flex-start" },
  medRight: { flex: 1, flexDirection: "row", gap: 6 },
  doseBox: {
    flex: 1,
    minHeight: 80,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 6,
  },
  doseTime: { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 13 },
  doseAdmin: { fontSize: 9, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  doseActualTime: { fontSize: 9, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  prnBadge: { backgroundColor: "#f9731622", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  prnBadgeText: { fontSize: 9, fontWeight: "800", color: "#f97316", letterSpacing: 0.5 },

  /* column labels */
  columnLabels: { flexDirection: "row", gap: 6, marginTop: 4, marginBottom: Spacing.lg },
  colLabel: { flex: 1, fontSize: 9, fontWeight: "600", textAlign: "center", letterSpacing: 0.3 },

  /* empty */
  emptyContainer: { paddingVertical: Spacing.xxl, alignItems: "center" },

  /* add bar */
  addBarContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.08)" },
  addBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, height: 52, borderRadius: 14 },
  addBarText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  /* modal */
  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formLabel: { fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm, fontSize: 11 },
  formInput: { height: 52, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 16, marginBottom: 2 },
  suggestionList: { borderWidth: 1, borderRadius: BorderRadius.medium, marginBottom: Spacing.sm, overflow: "hidden" },
  suggestionItem: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  slotRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.sm },
  slotNumBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  slotInput: { flex: 1, height: 48, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 15, borderWidth: 1, borderColor: "transparent" },
  quickPicks: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  quickPickBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  saveButton: { marginTop: Spacing.sm },
  segmentRow: { flexDirection: "row", borderRadius: BorderRadius.medium, overflow: "hidden", gap: 2 },
  segment: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: BorderRadius.small, backgroundColor: "rgba(0,0,0,0.06)" },
  routePills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  routePill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" },
  marSummary: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: BorderRadius.medium, padding: Spacing.md, gap: 6 },
  marSummaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  marDot: { width: 8, height: 8, borderRadius: 4 },
  omitModalContainer: { paddingTop: Spacing.xl },
  omitOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderBottomWidth: StyleSheet.hairlineWidth },
});
