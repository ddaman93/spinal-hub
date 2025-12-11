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
import { storage, Medication, MedicationLog, generateId, formatDate } from "@/lib/storage";

export default function MedicationTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [times, setTimes] = useState("8:00 AM");

  const today = formatDate(new Date());

  const loadData = useCallback(async () => {
    const meds = await storage.medications.getAll();
    setMedications(meds || []);
    const logs = await storage.medicationLogs.getByDate(today);
    setTodayLogs(logs || []);
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    const med: Medication = {
      id: generateId(),
      name,
      dosage,
      frequency,
      times: times.split(",").map((t) => t.trim()),
    };
    await storage.medications.add(med);
    await loadData();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequency("Daily");
    setTimes("8:00 AM");
  };

  const handleDelete = async (id: string) => {
    await storage.medications.delete(id);
    await loadData();
  };

  const handleToggleTaken = async (medication: Medication, scheduledTime: string) => {
    const existingLog = todayLogs.find(
      (l) => l.medicationId === medication.id && l.scheduledTime === scheduledTime
    );
    
    const log: MedicationLog = {
      id: existingLog?.id || generateId(),
      medicationId: medication.id,
      taken: !existingLog?.taken,
      scheduledTime,
      actualTime: !existingLog?.taken ? new Date().toISOString() : undefined,
      date: today,
    };
    
    await storage.medicationLogs.log(log);
    await loadData();
  };

  const isTaken = (medicationId: string, time: string) => {
    return todayLogs.some(
      (l) => l.medicationId === medicationId && l.scheduledTime === time && l.taken
    );
  };

  const renderMedication = ({ item }: { item: Medication }) => (
    <View style={[styles.medCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.medContent}>
        <View style={styles.medHeader}>
          <View style={styles.medInfo}>
            <ThemedText type="h4">{item.name}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.dosage} - {item.frequency}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => handleDelete(item.id)}
            style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
            accessible
            accessibilityLabel={`Delete ${item.name}`}
            accessibilityRole="button"
          >
            <Feather name="trash-2" size={18} color={theme.error} />
          </Pressable>
        </View>
        
        <View style={styles.timesContainer}>
          {item.times.map((time, index) => {
            const taken = isTaken(item.id, time);
            return (
              <Pressable
                key={index}
                onPress={() => handleToggleTaken(item, time)}
                style={[
                  styles.timeButton,
                  { backgroundColor: taken ? theme.success : theme.backgroundSecondary },
                ]}
                accessible
                accessibilityLabel={`${time}, ${taken ? "taken" : "not taken"}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: taken }}
              >
                <Feather 
                  name={taken ? "check-circle" : "circle"} 
                  size={20} 
                  color={taken ? "#FFFFFF" : theme.text} 
                />
                <ThemedText
                  type="body"
                  style={{ color: taken ? "#FFFFFF" : theme.text }}
                >
                  {time}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="h4">Today: {today}</ThemedText>
      </View>

      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ textAlign: "center" }}>
              No medications added.{"\n"}Tap below to add your medications.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Add medication"
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
            <ThemedText type="h3">Add Medication</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Medication Name</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Baclofen"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Medication name"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Dosage</ThemedText>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 10mg"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Dosage"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Frequency</ThemedText>
              <View style={styles.frequencyOptions}>
                {["Daily", "Twice Daily", "As Needed"].map((freq) => (
                  <Pressable
                    key={freq}
                    onPress={() => setFrequency(freq)}
                    style={[
                      styles.freqButton,
                      { backgroundColor: frequency === freq ? theme.primary : theme.backgroundDefault },
                    ]}
                    accessible
                    accessibilityLabel={freq}
                    accessibilityState={{ selected: frequency === freq }}
                  >
                    <ThemedText
                      type="body"
                      style={{ color: frequency === freq ? "#FFFFFF" : theme.text }}
                    >
                      {freq}
                    </ThemedText>
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
                accessible
                accessibilityLabel="Times to take medication"
              />
            </View>

            <Button onPress={handleSave} style={styles.saveButton}>
              Add Medication
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  medCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
  },
  medContent: {
    gap: Spacing.md,
  },
  medHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  medInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 48,
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
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
  },
  frequencyOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  freqButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 48,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
