import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal, ActivityIndicator } from "react-native";
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
  notes?: string | null;
};

type MedLog = {
  id: string;
  medicationId: string;
  scheduledTime: string;
  taken: boolean;
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MedicationTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { params } = useRoute<Route>();
  const { patientId } = params;

  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [times, setTimes] = useState("8:00 AM");

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
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/medications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, name, dosage, frequency, times }),
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

  const handleDelete = async (id: string) => {
    const token = await getToken();
    await fetch(`${getApiUrl()}/api/health/medications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggleTaken = async (medication: Medication, scheduledTime: string) => {
    const existing = todayLogs.find((l) => l.medicationId === medication.id && l.scheduledTime === scheduledTime);
    const taken = !existing?.taken;
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

  const isTaken = (medicationId: string, time: string) =>
    todayLogs.some((l) => l.medicationId === medicationId && l.scheduledTime === time && l.taken);

  const resetForm = () => {
    setName("");
    setShowSuggestions(false);
    setDosage("");
    setFrequency("Daily");
    setTimes("8:00 AM");
  };

  const renderMedication = ({ item }: { item: Medication }) => {
    const timeList = item.times.split(",").map((t) => t.trim()).filter(Boolean);
    return (
      <View style={[styles.medCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.medContent}>
          <View style={styles.medHeader}>
            <View style={styles.medInfo}>
              <ThemedText type="h4">{item.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.dosage} · {item.frequency}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => handleDelete(item.id)}
              style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
            >
              <Feather name="trash-2" size={18} color={theme.error} />
            </Pressable>
          </View>

          <View style={styles.timesContainer}>
            {timeList.map((time, index) => {
              const taken = isTaken(item.id, time);
              return (
                <Pressable
                  key={index}
                  onPress={() => handleToggleTaken(item, time)}
                  style={[styles.timeButton, { backgroundColor: taken ? theme.success : theme.backgroundSecondary }]}
                >
                  <Feather name={taken ? "check-circle" : "circle"} size={20} color={taken ? "#FFFFFF" : theme.text} />
                  <ThemedText type="body" style={{ color: taken ? "#FFFFFF" : theme.text }}>{time}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="h4">Today: {today}</ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="body" style={{ textAlign: "center" }}>
                No medications added.{"\n"}Tap + to add medications.
              </ThemedText>
            </View>
          }
        />
      )}

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable onPress={() => setModalVisible(true)} style={[styles.fab, { backgroundColor: theme.primary }]}>
          <ThemedText type="h3" style={{ color: "#FFFFFF" }}>+</ThemedText>
        </Pressable>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Add Medication</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Medication Name</ThemedText>
              <TextInput
                value={name}
                onChangeText={(text) => { setName(text); setShowSuggestions(true); }}
                placeholder="e.g., Baclofen"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                autoCorrect={false}
              />
              {showSuggestions && suggestions.length > 0 && (
                <View style={[styles.suggestionList, { backgroundColor: theme.backgroundDefault, borderColor: theme.primary + "40" }]}>
                  {suggestions.map((s) => (
                    <Pressable key={s} onPress={() => { setName(s); setShowSuggestions(false); }} style={[styles.suggestionItem, { borderBottomColor: theme.backgroundSecondary }]}>
                      <ThemedText type="body">{s}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Dosage</ThemedText>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 10mg"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Frequency</ThemedText>
              <View style={styles.frequencyOptions}>
                {["Daily", "Twice Daily", "As Needed"].map((freq) => (
                  <Pressable
                    key={freq}
                    onPress={() => setFrequency(freq)}
                    style={[styles.freqButton, { backgroundColor: frequency === freq ? theme.primary : theme.backgroundDefault }]}
                  >
                    <ThemedText type="body" style={{ color: frequency === freq ? "#FFFFFF" : theme.text }}>{freq}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Times (comma-separated)</ThemedText>
              <TextInput
                value={times}
                onChangeText={setTimes}
                placeholder="e.g., 8:00 AM, 8:00 PM"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              />
            </View>

            <Button onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? "Saving..." : "Add Medication"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  listContent: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingTop: Spacing.lg },
  medCard: { padding: Spacing.lg, borderRadius: BorderRadius.medium },
  medContent: { gap: Spacing.md },
  medHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  medInfo: { flex: 1, gap: Spacing.xs },
  deleteButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  timesContainer: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  timeButton: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium, minHeight: 48,
  },
  emptyContainer: { paddingTop: Spacing.xxl, alignItems: "center" },
  fabContainer: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  fab: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg,
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  formGroup: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.sm },
  input: { height: 56, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 18 },
  suggestionList: { borderWidth: 1, borderRadius: BorderRadius.medium, marginTop: 2, overflow: "hidden" },
  suggestionItem: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  frequencyOptions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  freqButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.medium, minHeight: 48 },
  saveButton: { marginTop: Spacing.lg },
});
