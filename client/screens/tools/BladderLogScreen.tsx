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
import { storage, BladderEntry, generateId, formatDate, formatTime } from "@/lib/storage";

const VOID_TYPES: { key: BladderEntry["type"]; label: string; color: string }[] = [
  { key: "catheterization", label: "Catheterization", color: "#007AFF" },
  { key: "spontaneous", label: "Spontaneous", color: "#22c55e" },
  { key: "leak", label: "Leak", color: "#f97316" },
  { key: "accident", label: "Accident", color: "#ef4444" },
];

export default function BladderLogScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<BladderEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<BladderEntry["type"]>("catheterization");
  const [volume, setVolume] = useState("");
  const [notes, setNotes] = useState("");

  const loadEntries = useCallback(async () => {
    const data = await storage.bladder.getAll();
    setEntries(data || []);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    const entry: BladderEntry = {
      id: generateId(),
      type: selectedType,
      volume: volume ? Number(volume) : undefined,
      notes: notes || undefined,
      timestamp: new Date().toISOString(),
    };
    await storage.bladder.add(entry);
    await loadEntries();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedType("catheterization");
    setVolume("");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    await storage.bladder.delete(id);
    await loadEntries();
  };

  const getTypeInfo = (type: BladderEntry["type"]) =>
    VOID_TYPES.find((t) => t.key === type) ?? VOID_TYPES[0];

  const renderEntry = ({ item }: { item: BladderEntry }) => {
    const date = new Date(item.timestamp);
    const typeInfo = getTypeInfo(item.type);
    return (
      <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + "22" }]}>
              <ThemedText type="small" style={{ color: typeInfo.color, fontWeight: "600" }}>
                {typeInfo.label}
              </ThemedText>
            </View>
            {item.volume !== undefined && (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.volume} mL
              </ThemedText>
            )}
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
          accessibilityLabel={`Delete ${typeInfo.label} entry`}
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
              No bladder events recorded yet.{"\n"}Tap + to log your first entry.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Add bladder log entry"
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
            <ThemedText type="h3">Log Bladder Event</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              TYPE
            </ThemedText>
            <View style={styles.optionGrid}>
              {VOID_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setSelectedType(t.key)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: selectedType === t.key ? t.color : theme.backgroundDefault,
                    },
                  ]}
                  accessible
                  accessibilityLabel={t.label}
                  accessibilityState={{ selected: selectedType === t.key }}
                >
                  <ThemedText
                    type="body"
                    style={{ color: selectedType === t.key ? "#FFFFFF" : theme.text }}
                  >
                    {t.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              VOLUME mL (OPTIONAL)
            </ThemedText>
            <TextInput
              value={volume}
              onChangeText={setVolume}
              placeholder="e.g. 300"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              style={[styles.volumeInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
              accessible
              accessibilityLabel="Volume in millilitres"
            />

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
  typeBadge: {
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
  volumeInput: {
    height: 48,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.xl,
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
