import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, VitalEntry, generateId, formatDate, formatTime } from "@/lib/storage";

const VITAL_TYPES = [
  { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg" },
  { key: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { key: "temperature", label: "Temperature", unit: "°F" },
  { key: "oxygen", label: "Oxygen Saturation", unit: "%" },
  { key: "weight", label: "Weight", unit: "lbs" },
] as const;

export default function VitalsLogScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof VITAL_TYPES[number]["key"]>("blood_pressure");
  const [value, setValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [notes, setNotes] = useState("");

  const loadEntries = useCallback(async () => {
    const data = await storage.vitals.getAll();
    setEntries(data || []);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    const entry: VitalEntry = {
      id: generateId(),
      type: selectedType,
      value: selectedType === "blood_pressure" ? `${systolic}/${diastolic}` : value,
      systolic: selectedType === "blood_pressure" ? parseInt(systolic) : undefined,
      diastolic: selectedType === "blood_pressure" ? parseInt(diastolic) : undefined,
      timestamp: new Date().toISOString(),
      notes: notes || undefined,
    };
    await storage.vitals.add(entry);
    await loadEntries();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setValue("");
    setSystolic("");
    setDiastolic("");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    await storage.vitals.delete(id);
    await loadEntries();
  };

  const getTypeLabel = (type: string) => {
    return VITAL_TYPES.find((t) => t.key === type)?.label || type;
  };

  const getTypeUnit = (type: string) => {
    return VITAL_TYPES.find((t) => t.key === type)?.unit || "";
  };

  const renderEntry = ({ item }: { item: VitalEntry }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <ThemedText type="h4">{getTypeLabel(item.type)}</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>
              {item.value} {getTypeUnit(item.type)}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {formatDate(date)} at {formatTime(date)}
          </ThemedText>
          {item.notes ? (
            <ThemedText type="small" style={[styles.notes, { color: theme.textSecondary }]}>
              {item.notes}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
          accessible
          accessibilityLabel={`Delete ${getTypeLabel(item.type)} entry`}
          accessibilityRole="button"
        >
          <Feather name="trash-2" size={20} color={theme.error} />
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ textAlign: "center" }}>
              No vital signs recorded yet.{"\n"}Tap the button below to add your first entry.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Add vital sign reading"
          accessibilityRole="button"
        >
          <ThemedText type="h3" style={{ color: "#FFFFFF" }}>+</ThemedText>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Log Vital Sign</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.typeSelector}>
              {VITAL_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  onPress={() => setSelectedType(type.key)}
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: selectedType === type.key ? theme.primary : theme.backgroundDefault,
                    },
                  ]}
                  accessible
                  accessibilityLabel={type.label}
                  accessibilityState={{ selected: selectedType === type.key }}
                >
                  <ThemedText
                    type="body"
                    style={{ color: selectedType === type.key ? "#FFFFFF" : theme.text }}
                  >
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
                    accessible
                    accessibilityLabel="Systolic blood pressure"
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
                    accessible
                    accessibilityLabel="Diastolic blood pressure"
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
                accessible
                accessibilityLabel={`${getTypeLabel(selectedType)} value`}
              />
            )}

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.input, styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              accessible
              accessibilityLabel="Notes"
            />

            <Button onPress={handleSave} style={styles.saveButton}>
              Save Entry
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  entryCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    alignItems: "center",
  },
  entryContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notes: {
    marginTop: Spacing.xs,
    fontStyle: "italic",
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingTop: Spacing.xxl,
    alignItems: "center",
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  bpInputs: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bpInputContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  bpSlash: {
    marginBottom: Spacing.md,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
  },
  fullInput: {
    marginBottom: Spacing.lg,
  },
  notesInput: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
    marginBottom: Spacing.xl,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
