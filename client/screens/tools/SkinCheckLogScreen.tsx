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
import { storage, SkinCheckEntry, generateId, formatDate, formatTime } from "@/lib/storage";

const LOCATIONS: SkinCheckEntry["location"][] = [
  "Tailbone",
  "Left Hip",
  "Right Hip",
  "Left Heel",
  "Right Heel",
  "Elbows",
  "Other",
];

const SEVERITY_OPTIONS: { key: SkinCheckEntry["severity"]; label: string; color: string }[] = [
  { key: "clear", label: "Clear", color: "#22c55e" },
  { key: "redness", label: "Redness", color: "#f97316" },
  { key: "broken", label: "Broken Skin", color: "#ef4444" },
];

export default function SkinCheckLogScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<SkinCheckEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SkinCheckEntry["location"]>("Tailbone");
  const [selectedSeverity, setSelectedSeverity] = useState<SkinCheckEntry["severity"]>("clear");
  const [notes, setNotes] = useState("");

  const loadEntries = useCallback(async () => {
    const data = await storage.skinChecks.getAll();
    setEntries(data || []);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    const entry: SkinCheckEntry = {
      id: generateId(),
      location: selectedLocation,
      severity: selectedSeverity,
      notes: notes || undefined,
      timestamp: new Date().toISOString(),
    };
    await storage.skinChecks.add(entry);
    await loadEntries();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedLocation("Tailbone");
    setSelectedSeverity("clear");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    await storage.skinChecks.delete(id);
    await loadEntries();
  };

  const getSeverityColor = (severity: SkinCheckEntry["severity"]) => {
    return SEVERITY_OPTIONS.find((s) => s.key === severity)?.color || theme.text;
  };

  const getSeverityLabel = (severity: SkinCheckEntry["severity"]) => {
    return SEVERITY_OPTIONS.find((s) => s.key === severity)?.label || severity;
  };

  const renderEntry = ({ item }: { item: SkinCheckEntry }) => {
    const date = new Date(item.timestamp);
    const severityColor = getSeverityColor(item.severity);
    return (
      <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <ThemedText type="h4">{item.location}</ThemedText>
            <View style={[styles.severityBadge, { backgroundColor: severityColor + "22" }]}>
              <ThemedText type="small" style={{ color: severityColor, fontWeight: "600" }}>
                {getSeverityLabel(item.severity)}
              </ThemedText>
            </View>
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
          accessibilityLabel={`Delete skin check entry for ${item.location}`}
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
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ textAlign: "center" }}>
              No skin checks recorded yet.{"\n"}Tap + to log your first check.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Add skin check entry"
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
            <ThemedText type="h3">Log Skin Check</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              LOCATION
            </ThemedText>
            <View style={styles.optionGrid}>
              {LOCATIONS.map((loc) => (
                <Pressable
                  key={loc}
                  onPress={() => setSelectedLocation(loc)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: selectedLocation === loc ? theme.primary : theme.backgroundDefault,
                    },
                  ]}
                  accessible
                  accessibilityLabel={loc}
                  accessibilityState={{ selected: selectedLocation === loc }}
                >
                  <ThemedText
                    type="body"
                    style={{ color: selectedLocation === loc ? "#FFFFFF" : theme.text }}
                  >
                    {loc}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              SEVERITY
            </ThemedText>
            <View style={styles.optionGrid}>
              {SEVERITY_OPTIONS.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setSelectedSeverity(s.key)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        selectedSeverity === s.key ? s.color : theme.backgroundDefault,
                    },
                  ]}
                  accessible
                  accessibilityLabel={s.label}
                  accessibilityState={{ selected: selectedSeverity === s.key }}
                >
                  <ThemedText
                    type="body"
                    style={{ color: selectedSeverity === s.key ? "#FFFFFF" : theme.text }}
                  >
                    {s.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              NOTES (OPTIONAL)
            </ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
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
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.small,
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
  sectionLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  optionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  notesInput: {
    height: 100,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: Spacing.xl,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
