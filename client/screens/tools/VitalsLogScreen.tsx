import React, { useState, useCallback } from "react";
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

const VITAL_TYPES = [
  { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg" },
  { key: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { key: "temperature", label: "Temperature", unit: "°F" },
  { key: "oxygen", label: "Oxygen Saturation", unit: "%" },
  { key: "weight", label: "Weight", unit: "lbs" },
] as const;

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

export default function VitalsLogScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { params } = useRoute<Route>();
  const { patientId, patientName } = params;

  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof VITAL_TYPES[number]["key"]>("blood_pressure");
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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const body: Record<string, unknown> = { patientId, type: selectedType };
      if (selectedType === "blood_pressure") {
        body.value = `${systolic}/${diastolic}`;
        body.systolic = parseInt(systolic) || null;
        body.diastolic = parseInt(diastolic) || null;
      } else {
        body.value = value;
      }
      if (notes) body.notes = notes;

      const res = await fetch(`${getApiUrl()}/api/health/vitals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${await getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await load();
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
    await fetch(`${getApiUrl()}/api/health/vitals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const resetForm = () => {
    setValue("");
    setSystolic("");
    setDiastolic("");
    setNotes("");
    setSelectedType("blood_pressure");
  };

  const getTypeLabel = (type: string) => VITAL_TYPES.find((t) => t.key === type)?.label ?? type;
  const getTypeUnit = (type: string) => VITAL_TYPES.find((t) => t.key === type)?.unit ?? "";

  const renderEntry = ({ item }: { item: VitalEntry }) => (
    <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.entryContent}>
        <View style={styles.entryHeader}>
          <ThemedText type="h4">{getTypeLabel(item.type)}</ThemedText>
          <ThemedText type="body" style={{ color: theme.primary }}>
            {item.value} {getTypeUnit(item.type)}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {item.authorName} · {timeAgo(item.createdAt)}
        </ThemedText>
        {item.notes ? (
          <ThemedText type="small" style={[styles.notesText, { color: theme.textSecondary }]}>
            {item.notes}
          </ThemedText>
        ) : null}
      </View>
      <Pressable
        onPress={() => handleDelete(item.id)}
        style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
      >
        <Feather name="trash-2" size={20} color={theme.error} />
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: Spacing.lg, paddingBottom: insets.bottom + 100 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="body" style={{ textAlign: "center" }}>
                No vital signs recorded yet.{"\n"}Tap + to add the first entry.
              </ThemedText>
            </View>
          }
        />
      )}

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
        >
          <ThemedText type="h3" style={{ color: "#FFFFFF" }}>+</ThemedText>
        </Pressable>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Log Vital Sign</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.typeSelector}>
              {VITAL_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  onPress={() => setSelectedType(type.key)}
                  style={[styles.typeButton, { backgroundColor: selectedType === type.key ? theme.primary : theme.backgroundDefault }]}
                >
                  <ThemedText type="body" style={{ color: selectedType === type.key ? "#FFFFFF" : theme.text }}>
                    {type.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {selectedType === "blood_pressure" ? (
              <View style={styles.bpInputs}>
                <View style={styles.bpInputContainer}>
                  <ThemedText type="small">Systolic</ThemedText>
                  <TextInput
                    value={systolic}
                    onChangeText={setSystolic}
                    keyboardType="numeric"
                    placeholder="120"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                  />
                </View>
                <ThemedText type="h3" style={styles.bpSlash}>/</ThemedText>
                <View style={styles.bpInputContainer}>
                  <ThemedText type="small">Diastolic</ThemedText>
                  <TextInput
                    value={diastolic}
                    onChangeText={setDiastolic}
                    keyboardType="numeric"
                    placeholder="80"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                  />
                </View>
              </View>
            ) : (
              <TextInput
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                placeholder={`Enter ${getTypeLabel(selectedType)}`}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, styles.fullInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              />
            )}

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.input, styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <Button onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  entryCard: {
    flexDirection: "row", padding: Spacing.lg,
    borderRadius: BorderRadius.medium, gap: Spacing.md, alignItems: "center",
  },
  entryContent: { flex: 1, gap: Spacing.xs },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notesText: { marginTop: Spacing.xs, fontStyle: "italic" },
  deleteButton: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
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
  typeSelector: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  typeButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.medium },
  bpInputs: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.md, marginBottom: Spacing.lg },
  bpInputContainer: { flex: 1, gap: Spacing.xs },
  bpSlash: { marginBottom: Spacing.md },
  input: { height: 56, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 18 },
  fullInput: { marginBottom: Spacing.lg },
  notesInput: { height: 100, paddingTop: Spacing.md, textAlignVertical: "top", marginBottom: Spacing.xl },
  saveButton: { marginTop: Spacing.lg },
});
