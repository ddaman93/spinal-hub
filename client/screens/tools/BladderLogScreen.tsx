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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BladderEntry = {
  id: string;
  type: string;
  bagType?: string | null;
  volumeMl?: number | null;
  notes?: string | null;
  authorName: string;
  createdAt: string;
};

type BladderMethod = "ic" | "spc" | "urethral" | null;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAILY_TARGET_ML = 1800;
const OVERDUE_HOURS = 5;
const DEFAULT_DAY_THRESHOLD = 500;
const THRESHOLD_KEY_PREFIX = "bladder_threshold_v1:";
const METHOD_KEY_PREFIX = "bladder_method_v1:";

const DAY_TYPE_CONFIGS: { key: string; label: string; shortLabel: string; color: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { key: "catheterization", label: "Catheterization / Empty", shortLabel: "CATH", color: "#007AFF", icon: "droplet" },
  { key: "spontaneous",     label: "Spontaneous Void",        shortLabel: "VOID", color: "#22c55e", icon: "check-circle" },
  { key: "leak",            label: "Leak",                    shortLabel: "LEAK", color: "#f97316", icon: "alert-circle" },
  { key: "accident",        label: "Accident",                shortLabel: "ACC",  color: "#ef4444", icon: "x-circle" },
];

const NIGHT_TYPE_CONFIGS: { key: string; label: string; shortLabel: string; color: string; icon: React.ComponentProps<typeof Feather>["name"]; hasVolume: boolean }[] = [
  { key: "bag_attach", label: "Attach night bag",     shortLabel: "ON",   color: "#8B5CF6", icon: "moon",      hasVolume: false },
  { key: "catheterization", label: "Empty & remove bag", shortLabel: "OFF",  color: "#007AFF", icon: "sun",       hasVolume: true  },
  { key: "leak",       label: "Overnight leak",       shortLabel: "LEAK", color: "#f97316", icon: "alert-circle", hasVolume: false },
];

const QUICK_VOLUMES = [200, 300, 400, 500, 600];

function thresholdKey(id: string) { return `${THRESHOLD_KEY_PREFIX}${id || "self"}`; }
function methodKey(id: string) { return `${METHOD_KEY_PREFIX}${id || "self"}`; }

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

function hoursSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 3600000;
}

function minutesBetween(a: string, b: string): number {
  return Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function getBagType(entry: BladderEntry): "day" | "night" {
  return entry.bagType === "night" ? "night" : "day";
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

  // Method setup
  const [method, setMethod] = useState<BladderMethod>(null);
  const [methodModalVisible, setMethodModalVisible] = useState(false);

  // Log modal
  const [modalVisible, setModalVisible] = useState(false);
  const [activeBag, setActiveBag] = useState<"day" | "night">("day");
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState("catheterization");
  const [volumeText, setVolumeText] = useState("");
  const [notes, setNotes] = useState("");

  // Threshold
  const [dayThreshold, setDayThreshold] = useState(DEFAULT_DAY_THRESHOLD);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState("");

  // Load prefs
  useFocusEffect(useCallback(() => {
    Promise.all([
      AsyncStorage.getItem(thresholdKey(patientId)),
      AsyncStorage.getItem(methodKey(patientId)),
    ]).then(([tRaw, mRaw]) => {
      const t = tRaw ? parseInt(tRaw, 10) : NaN;
      setDayThreshold(isNaN(t) ? DEFAULT_DAY_THRESHOLD : t);
      if (mRaw) setMethod(mRaw as BladderMethod);
      else setMethodModalVisible(true);
    });
  }, [patientId]));

  useFocusEffect(useCallback(() => { load(); }, []));

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

  const saveMethod = async (m: BladderMethod) => {
    if (!m) return;
    await AsyncStorage.setItem(methodKey(patientId), m);
    setMethod(m);
    setMethodModalVisible(false);
  };

  const saveThreshold = async () => {
    const val = parseInt(thresholdDraft, 10);
    if (isNaN(val) || val < 50 || val > 2000) {
      Alert.alert("Invalid", "Enter a value between 50 and 2000 mL.");
      return;
    }
    await AsyncStorage.setItem(thresholdKey(patientId), String(val));
    setDayThreshold(val);
    setThresholdModalVisible(false);
  };

  const openLog = (bag: "day" | "night") => {
    setActiveBag(bag);
    setSelectedType(bag === "night" ? "bag_attach" : "catheterization");
    setVolumeText("");
    setNotes("");
    setModalVisible(true);
  };

  const handleSave = async () => {
    const nightCfg = NIGHT_TYPE_CONFIGS.find((c) => c.key === selectedType);
    if (activeBag === "night" && nightCfg?.hasVolume && !volumeText) {
      Alert.alert("Volume required", "Enter the drained volume for this entry.");
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/bladder-logs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          type: selectedType,
          bagType: activeBag,
          volumeMl: volumeText ? Number(volumeText) : undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save failed", err.message ?? `Server error ${res.status}.`);
        return;
      }
      setModalVisible(false);
      await load();
    } catch (e: any) {
      Alert.alert("Network error", e?.message ?? "Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete entry", "Remove this entry?", [
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

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------

  const todayEntries = entries.filter((e) => isToday(e.createdAt));
  const todayDay = todayEntries.filter((e) => getBagType(e) === "day");
  const todayNight = todayEntries.filter((e) => getBagType(e) === "night");

  const dayOutput = todayDay.reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const dayCaths = todayDay.filter((e) => e.type === "catheterization").length;
  const dayLeaks = todayDay.filter((e) => e.type === "leak" || e.type === "accident").length;
  const dayAvg = dayCaths > 0
    ? Math.round(todayDay.filter((e) => e.type === "catheterization").reduce((s, e) => s + (e.volumeMl ?? 0), 0) / dayCaths)
    : 0;

  // Last cath for overdue warning (day entries only)
  const lastDayCath = todayDay.find((e) => e.type === "catheterization");
  const hoursSinceDayCath = lastDayCath ? hoursSince(lastDayCath.createdAt) : null;
  const cathOverdue = method === "ic" && hoursSinceDayCath != null && hoursSinceDayCath >= OVERDUE_HOURS;

  // Day high vol
  const dayHighVolEntry = todayDay.find((e) => (e.volumeMl ?? 0) > dayThreshold);

  // Night bag pairing: find most recent attach + its matching empty/remove
  const nightBagEntries = entries.filter((e) => getBagType(e) === "night");
  const lastNightAttach = nightBagEntries.find((e) => e.type === "bag_attach");
  const lastNightEmpty = nightBagEntries.find((e) => e.type === "catheterization");
  const nightBagActive = lastNightAttach && (!lastNightEmpty || new Date(lastNightAttach.createdAt) > new Date(lastNightEmpty.createdAt));
  const nightDuration = lastNightAttach && lastNightEmpty && new Date(lastNightEmpty.createdAt) > new Date(lastNightAttach.createdAt)
    ? minutesBetween(lastNightAttach.createdAt, lastNightEmpty.createdAt)
    : null;
  const nightVolume = lastNightEmpty?.volumeMl;

  // Group all entries by date for history
  type HistoryGroup = { label: string; dayItems: BladderEntry[]; nightItems: BladderEntry[] };
  const groups: HistoryGroup[] = [];
  for (const entry of entries) {
    const label = formatGroupDate(entry.createdAt);
    let group = groups.find((g) => g.label === label);
    if (!group) { group = { label, dayItems: [], nightItems: [] }; groups.push(group); }
    if (getBagType(entry) === "night") group.nightItems.push(entry);
    else group.dayItems.push(entry);
  }

  const outputProgress = Math.min(dayOutput / DAILY_TARGET_ML, 1);
  const isCustomThreshold = dayThreshold !== DEFAULT_DAY_THRESHOLD;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const nightTypeCfg = NIGHT_TYPE_CONFIGS.find((c) => c.key === selectedType);
  const showVolumeForNight = activeBag === "night" && (nightTypeCfg?.hasVolume ?? false);
  const showVolumeForDay = activeBag === "day";

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
                {Math.floor(hoursSinceDayCath!)}h {Math.round((hoursSinceDayCath! % 1) * 60)}m since last cath. Target: every 4–6 hours.
              </ThemedText>
            </View>
          </View>
        )}
        {dayHighVolEntry && (
          <View style={[styles.alertBanner, { backgroundColor: "#ef4444" }]}>
            <Feather name="alert-triangle" size={16} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.alertTitle}>High Volume — Overdistension Risk</ThemedText>
              <ThemedText style={styles.alertBody}>
                {dayHighVolEntry.volumeMl} mL recorded at {formatTime(dayHighVolEntry.createdAt)}. Exceeds your {dayThreshold} mL threshold.
              </ThemedText>
            </View>
          </View>
        )}

        {/* ── DAY BAG SECTION ── */}
        <View style={[styles.bagSection, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.bagSectionHeader}>
            <View style={[styles.bagIcon, { backgroundColor: "#007AFF22" }]}>
              <Feather name="sun" size={16} color="#007AFF" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.bagTitle, { color: theme.text }]}>Day Bag</ThemedText>
              <ThemedText style={[styles.bagSubtitle, { color: theme.textSecondary }]}>
                {method === "ic" ? "Intermittent catheterization" : "Leg bag / daytime drainage"}
              </ThemedText>
            </View>
            <Pressable onPress={() => openLog("day")} style={[styles.logBtn, { backgroundColor: "#007AFF" }]}>
              <Feather name="plus" size={14} color="#fff" />
              <ThemedText style={styles.logBtnText}>Log</ThemedText>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatTile label="Output" value={`${dayOutput}`} unit="mL" color="#007AFF" />
            <StatTile label={method === "ic" ? "Catheters" : "Empties"} value={`${dayCaths}`} unit="today" color="#007AFF" />
            <StatTile label="Avg Vol" value={dayAvg > 0 ? `${dayAvg}` : "—"} unit="mL" color="#007AFF" />
            <StatTile label="Leaks" value={`${dayLeaks}`} unit="events" color={dayLeaks > 0 ? "#f97316" : "#007AFF"} warn={dayLeaks > 0} />
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${outputProgress * 100}%`, backgroundColor: "#007AFF" }]} />
            </View>
            <ThemedText style={[styles.progressLabel, { color: theme.textSecondary }]}>
              {dayOutput} / {DAILY_TARGET_ML} mL daily target
            </ThemedText>
          </View>

          {/* threshold row */}
          <Pressable onPress={() => { setThresholdDraft(String(dayThreshold)); setThresholdModalVisible(true); }} style={[styles.thresholdRow, { borderTopColor: theme.border ?? "#E0E0E0" }]}>
            <Feather name="alert-circle" size={12} color="#ef4444" />
            <ThemedText style={[styles.thresholdText, { color: theme.textSecondary }]}>
              Alert above <ThemedText style={{ fontWeight: "700", color: theme.text }}>{dayThreshold} mL</ThemedText>
              {isCustomThreshold ? <ThemedText style={{ color: theme.primary }}> (custom)</ThemedText> : ""}
            </ThemedText>
            <Feather name="edit-2" size={11} color={theme.primary} />
          </Pressable>
        </View>

        {/* ── NIGHT BAG SECTION ── */}
        <View style={[styles.bagSection, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.bagSectionHeader}>
            <View style={[styles.bagIcon, { backgroundColor: "#8B5CF622" }]}>
              <Feather name="moon" size={16} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.bagTitle, { color: theme.text }]}>Night Bag</ThemedText>
              <ThemedText style={[styles.bagSubtitle, { color: theme.textSecondary }]}>
                {nightBagActive ? "Bag currently attached" : "Free overnight drainage"}
              </ThemedText>
            </View>
            <Pressable onPress={() => openLog("night")} style={[styles.logBtn, { backgroundColor: "#8B5CF6" }]}>
              <Feather name="plus" size={14} color="#fff" />
              <ThemedText style={styles.logBtnText}>Log</ThemedText>
            </Pressable>
          </View>

          {/* Active bag indicator */}
          {nightBagActive && lastNightAttach && (
            <View style={[styles.nightActiveBanner, { backgroundColor: "#8B5CF611", borderColor: "#8B5CF633" }]}>
              <Feather name="moon" size={14} color="#8B5CF6" />
              <ThemedText style={{ fontSize: 13, color: "#8B5CF6", flex: 1 }}>
                Bag attached at <ThemedText style={{ fontWeight: "700" }}>{formatTime(lastNightAttach.createdAt)}</ThemedText>
                {" · "}{formatDuration(hoursSince(lastNightAttach.createdAt) * 60)} ago
              </ThemedText>
            </View>
          )}

          {/* Last night summary */}
          {!nightBagActive && lastNightEmpty && (
            <View style={styles.nightSummaryRow}>
              {nightVolume != null && (
                <View style={[styles.nightStatTile, { backgroundColor: "#8B5CF611" }]}>
                  <ThemedText style={[styles.nightStatValue, { color: "#8B5CF6" }]}>{nightVolume}</ThemedText>
                  <ThemedText style={[styles.nightStatUnit, { color: "#8B5CF6" }]}>mL drained</ThemedText>
                </View>
              )}
              {nightDuration != null && (
                <View style={[styles.nightStatTile, { backgroundColor: "#8B5CF611" }]}>
                  <ThemedText style={[styles.nightStatValue, { color: "#8B5CF6" }]}>{formatDuration(nightDuration)}</ThemedText>
                  <ThemedText style={[styles.nightStatUnit, { color: "#8B5CF6" }]}>bag duration</ThemedText>
                </View>
              )}
              {!nightVolume && !nightDuration && (
                <ThemedText style={[styles.noNightData, { color: theme.textSecondary }]}>No data from last night</ThemedText>
              )}
            </View>
          )}

          {!lastNightAttach && !lastNightEmpty && (
            <ThemedText style={[styles.noNightData, { color: theme.textSecondary }]}>
              Tap Log to record when you attach your night bag.
            </ThemedText>
          )}
        </View>

        {/* ── HISTORY ── */}
        {groups.length > 0 && (
          <View style={styles.historySection}>
            <ThemedText style={[styles.historyHeader, { color: theme.textSecondary }]}>HISTORY</ThemedText>
            {groups.map((group) => (
              <View key={group.label} style={styles.historyGroup}>
                <ThemedText style={[styles.historyGroupLabel, { color: theme.textSecondary }]}>{group.label}</ThemedText>

                {group.dayItems.length > 0 && (
                  <View style={[styles.historyCard, { backgroundColor: theme.backgroundDefault }]}>
                    <View style={styles.historyCardHeader}>
                      <Feather name="sun" size={11} color="#007AFF" />
                      <ThemedText style={[styles.historyCardTitle, { color: "#007AFF" }]}>Day Bag</ThemedText>
                    </View>
                    {group.dayItems.map((entry, i) => (
                      <HistoryRow
                        key={entry.id}
                        entry={entry}
                        isLast={i === group.dayItems.length - 1}
                        accentColor="#007AFF"
                        dayThreshold={dayThreshold}
                        onDelete={handleDelete}
                        theme={theme}
                      />
                    ))}
                  </View>
                )}

                {group.nightItems.length > 0 && (
                  <View style={[styles.historyCard, { backgroundColor: theme.backgroundDefault, marginTop: group.dayItems.length > 0 ? Spacing.sm : 0 }]}>
                    <View style={styles.historyCardHeader}>
                      <Feather name="moon" size={11} color="#8B5CF6" />
                      <ThemedText style={[styles.historyCardTitle, { color: "#8B5CF6" }]}>Night Bag</ThemedText>
                    </View>
                    {group.nightItems.map((entry, i) => (
                      <HistoryRow
                        key={entry.id}
                        entry={entry}
                        isLast={i === group.nightItems.length - 1}
                        accentColor="#8B5CF6"
                        dayThreshold={null}
                        onDelete={handleDelete}
                        theme={theme}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {entries.length > 0 && (
          <ThemedText style={[styles.holdHint, { color: theme.textSecondary }]}>Hold an entry to delete</ThemedText>
        )}
      </ScrollView>

      {/* ── METHOD SETUP MODAL ── */}
      <Modal visible={methodModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMethodModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Bladder Management</ThemedText>
            {method && (
              <Pressable onPress={() => setMethodModalVisible(false)}>
                <ThemedText type="body" style={{ color: theme.primary }}>Done</ThemedText>
              </Pressable>
            )}
          </View>
          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19, marginBottom: Spacing.xl }}>
              This helps tailor the diary labels and alerts to your routine. You can change this any time.
            </ThemedText>
            {[
              { key: "ic" as BladderMethod, label: "Intermittent Catheterization (IC)", desc: "Self-cath every few hours during the day, no permanent catheter", icon: "activity" as const },
              { key: "spc" as BladderMethod, label: "Suprapubic Catheter (SPC)", desc: "Permanent catheter through the abdomen, day bag + night bag", icon: "droplet" as const },
              { key: "urethral" as BladderMethod, label: "Urethral Catheter (IDC)", desc: "Permanent urethral catheter, day bag + night bag", icon: "droplet" as const },
            ].map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => saveMethod(opt.key)}
                style={[
                  styles.methodOption,
                  { backgroundColor: method === opt.key ? theme.primary + "18" : theme.backgroundDefault, borderColor: method === opt.key ? theme.primary : theme.border ?? "#E0E0E0" },
                ]}
              >
                <Feather name={opt.icon} size={20} color={method === opt.key ? theme.primary : theme.textSecondary} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{opt.label}</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{opt.desc}</ThemedText>
                </View>
                {method === opt.key && <Feather name="check-circle" size={18} color={theme.primary} />}
              </Pressable>
            ))}
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>

      {/* ── LOG MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name={activeBag === "day" ? "sun" : "moon"} size={18} color={activeBag === "day" ? "#007AFF" : "#8B5CF6"} />
              <ThemedText type="h3">{activeBag === "day" ? "Day Bag" : "Night Bag"}</ThemedText>
            </View>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>EVENT TYPE</ThemedText>
            <View style={styles.typeGrid}>
              {(activeBag === "day" ? DAY_TYPE_CONFIGS : NIGHT_TYPE_CONFIGS).map((t) => (
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

            {(showVolumeForDay || showVolumeForNight) && (
              <>
                <ThemedText style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>VOLUME (mL)</ThemedText>
                <View style={styles.quickRow}>
                  {(activeBag === "night" ? [500, 750, 1000, 1250, 1500] : QUICK_VOLUMES).map((v) => {
                    const isHigh = activeBag === "day" && v > dayThreshold;
                    return (
                      <Pressable
                        key={v}
                        onPress={() => setVolumeText(String(v))}
                        style={[
                          styles.quickVolumeBtn,
                          volumeText === String(v) ? { backgroundColor: activeBag === "day" ? "#007AFF" : "#8B5CF6" } : { backgroundColor: theme.backgroundDefault },
                          isHigh && { borderWidth: 1, borderColor: "#ef444440" },
                        ]}
                      >
                        <ThemedText style={{ fontSize: 13, fontWeight: "700", color: volumeText === String(v) ? "#FFFFFF" : theme.text }}>{v}</ThemedText>
                        {isHigh && <ThemedText style={{ fontSize: 9, color: volumeText === String(v) ? "rgba(255,255,255,0.8)" : "#ef4444" }}>⚠</ThemedText>}
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
                {activeBag === "day" && volumeText && Number(volumeText) > dayThreshold && (
                  <View style={styles.highVolWarning}>
                    <Feather name="alert-triangle" size={13} color="#ef4444" />
                    <ThemedText style={{ fontSize: 12, color: "#ef4444" }}>
                      Exceeds your {dayThreshold} mL threshold — overdistension and AD risk.
                    </ThemedText>
                  </View>
                )}
              </>
            )}

            {activeBag === "night" && selectedType === "bag_attach" && (
              <View style={[styles.attachNote, { backgroundColor: "#8B5CF611" }]}>
                <Feather name="info" size={14} color="#8B5CF6" />
                <ThemedText style={{ fontSize: 13, color: "#8B5CF6", flex: 1 }}>
                  This records the time you attached the night bag. Log "Empty & remove" in the morning to complete the pair.
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
            <ThemedText type="h3">Day Bag Alert Threshold</ThemedText>
            <Pressable onPress={() => setThresholdModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>
          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19, marginBottom: Spacing.lg }}>
              Set the single-void or bag-empty volume that triggers a high-volume alert for your day bag. Consortium for Spinal Cord Medicine guidelines recommend 400–500 mL as the upper safe limit, but your personal capacity may differ. Night bag has no alert — large overnight volumes are expected.
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
              Accepted range: 50–2000 mL. Default: {DEFAULT_DAY_THRESHOLD} mL.
            </ThemedText>
            <Button onPress={saveThreshold} style={styles.saveButton}>Save threshold</Button>
            {isCustomThreshold && (
              <Pressable onPress={async () => { await AsyncStorage.removeItem(thresholdKey(patientId)); setDayThreshold(DEFAULT_DAY_THRESHOLD); setThresholdModalVisible(false); }} style={{ alignItems: "center", paddingVertical: Spacing.md }}>
                <ThemedText style={{ color: theme.error, fontSize: 14, fontWeight: "600" }}>Reset to default ({DEFAULT_DAY_THRESHOLD} mL)</ThemedText>
              </Pressable>
            )}

            <Pressable onPress={() => { setThresholdModalVisible(false); setMethodModalVisible(true); }} style={{ alignItems: "center", paddingVertical: Spacing.sm }}>
              <ThemedText style={{ color: theme.primary, fontSize: 13 }}>Change bladder management method</ThemedText>
            </Pressable>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// HistoryRow sub-component
// ---------------------------------------------------------------------------

function HistoryRow({ entry, isLast, accentColor, dayThreshold, onDelete, theme }: {
  entry: BladderEntry;
  isLast: boolean;
  accentColor: string;
  dayThreshold: number | null;
  onDelete: (id: string) => void;
  theme: any;
}) {
  const isNightEntry = entry.bagType === "night";
  const highVol = dayThreshold != null && (entry.volumeMl ?? 0) > dayThreshold;
  const dotColor = highVol ? "#ef4444" : accentColor;

  let typeLabel = entry.type;
  if (entry.type === "catheterization") typeLabel = isNightEntry ? "Emptied & removed" : "Catheterization / Empty";
  else if (entry.type === "bag_attach") typeLabel = "Attached night bag";
  else if (entry.type === "spontaneous") typeLabel = "Spontaneous void";
  else if (entry.type === "leak") typeLabel = "Leak";
  else if (entry.type === "accident") typeLabel = "Accident";

  return (
    <Pressable
      onLongPress={() => onDelete(entry.id)}
      style={[
        styles.historyRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border ?? "#E0E0E0" },
        highVol && { backgroundColor: "#ef444408" },
      ]}
    >
      <View style={[styles.historyDot, { backgroundColor: dotColor }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <ThemedText style={[styles.historyType, { color: theme.text }]}>{typeLabel}</ThemedText>
          {entry.volumeMl != null && (
            <ThemedText style={[styles.historyVolume, { color: highVol ? "#ef4444" : accentColor }]}>
              {entry.volumeMl} mL{highVol ? " ⚠" : ""}
            </ThemedText>
          )}
        </View>
        <ThemedText style={[styles.historyMeta, { color: theme.textSecondary }]}>
          {entry.authorName} · {formatTime(entry.createdAt)}
        </ThemedText>
        {entry.notes ? <ThemedText style={[styles.historyNotes, { color: theme.textSecondary }]}>{entry.notes}</ThemedText> : null}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// StatTile sub-component
// ---------------------------------------------------------------------------

function StatTile({ label, value, unit, color, warn }: { label: string; value: string; unit: string; color: string; warn?: boolean }) {
  return (
    <View style={statStyles.tile}>
      <ThemedText style={[statStyles.value, { color: warn ? "#f97316" : color }]}>{value}</ThemedText>
      <ThemedText style={statStyles.unit}>{unit}</ThemedText>
      <ThemedText style={statStyles.label}>{label}</ThemedText>
    </View>
  );
}

const statStyles = StyleSheet.create({
  tile: { flex: 1, alignItems: "center", gap: 2 },
  value: { fontSize: 20, fontWeight: "800", lineHeight: 24 },
  unit: { fontSize: 10, color: "rgba(0,0,0,0.4)" },
  label: { fontSize: 10, color: "rgba(0,0,0,0.4)", textAlign: "center" },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  alertBanner: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, padding: Spacing.md, margin: Spacing.lg, marginBottom: 0, borderRadius: BorderRadius.medium },
  alertTitle: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  alertBody: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2, lineHeight: 16 },

  bagSection: { margin: Spacing.lg, marginBottom: 0, borderRadius: BorderRadius.large, padding: Spacing.lg, gap: Spacing.md },
  bagSectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  bagIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  bagTitle: { fontSize: 17, fontWeight: "800" },
  bagSubtitle: { fontSize: 12, marginTop: 1 },
  logBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  logBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },

  statsRow: { flexDirection: "row", gap: Spacing.sm },
  progressRow: { gap: 6 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(0,0,0,0.08)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 11 },

  thresholdRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  thresholdText: { flex: 1, fontSize: 12 },

  nightActiveBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: Spacing.sm, borderRadius: BorderRadius.medium, borderWidth: 1 },
  nightSummaryRow: { flexDirection: "row", gap: Spacing.sm },
  nightStatTile: { flex: 1, alignItems: "center", paddingVertical: Spacing.sm, borderRadius: BorderRadius.medium, gap: 2 },
  nightStatValue: { fontSize: 20, fontWeight: "800" },
  nightStatUnit: { fontSize: 11, fontWeight: "600" },
  noNightData: { fontSize: 12, opacity: 0.5, paddingVertical: Spacing.xs },

  historySection: { margin: Spacing.lg },
  historyHeader: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  historyGroup: { marginBottom: Spacing.lg },
  historyGroupLabel: { fontSize: 12, fontWeight: "700", marginBottom: Spacing.xs },
  historyCard: { borderRadius: BorderRadius.medium, overflow: "hidden" },
  historyCardHeader: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 4 },
  historyCardTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  historyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: 10, gap: Spacing.sm },
  historyDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  historyType: { fontSize: 14, fontWeight: "600" },
  historyVolume: { fontSize: 15, fontWeight: "800" },
  historyMeta: { fontSize: 11, marginTop: 1 },
  historyNotes: { fontSize: 12, fontStyle: "italic", marginTop: 2 },

  holdHint: { textAlign: "center", fontSize: 11, opacity: 0.4, paddingBottom: Spacing.md, marginTop: Spacing.sm },

  methodOption: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.medium, borderWidth: 1.5, marginBottom: Spacing.sm },

  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  typeOption: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.medium, borderWidth: 1.5, flex: 1, minWidth: "45%" },
  typeOptionText: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  quickRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  quickVolumeBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: BorderRadius.medium, gap: 2 },
  volumeInput: { height: 52, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: Spacing.sm },
  highVolWarning: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#ef444414", borderRadius: BorderRadius.small, padding: Spacing.sm, marginBottom: Spacing.sm },
  attachNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: Spacing.sm, borderRadius: BorderRadius.small, marginTop: Spacing.sm },
  notesInput: { height: 90, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 15, textAlignVertical: "top", marginBottom: Spacing.md },
  saveButton: { marginTop: Spacing.sm },

  emptyContainer: { alignItems: "center", paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },
});
