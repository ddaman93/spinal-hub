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
import { storage, PainEntry, generateId, formatDate, formatTime } from "@/lib/storage";

const PAIN_LOCATIONS = [
  "Head", "Neck", "Shoulders", "Upper Back", "Lower Back",
  "Arms", "Hands", "Chest", "Abdomen", "Hips", "Legs", "Feet", "Other"
];

export default function PainJournalScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<PainEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [painLevel, setPainLevel] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState("Lower Back");
  const [description, setDescription] = useState("");

  const loadEntries = useCallback(async () => {
    const data = await storage.pain.getAll();
    setEntries(data || []);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    const entry: PainEntry = {
      id: generateId(),
      level: painLevel,
      location: selectedLocation,
      description: description || undefined,
      timestamp: new Date().toISOString(),
    };
    await storage.pain.add(entry);
    await loadEntries();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setPainLevel(5);
    setSelectedLocation("Lower Back");
    setDescription("");
  };

  const handleDelete = async (id: string) => {
    await storage.pain.delete(id);
    await loadEntries();
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return theme.success;
    if (level <= 6) return theme.warning;
    return theme.error;
  };

  const renderEntry = ({ item }: { item: PainEntry }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.entryContent}>
          <View style={styles.painIndicator}>
            <View 
              style={[
                styles.painBadge, 
                { backgroundColor: getPainColor(item.level) }
              ]}
            >
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
                {item.level}
              </ThemedText>
            </View>
            <View style={styles.painDetails}>
              <ThemedText type="h4">{item.location}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {formatDate(date)}
              </ThemedText>
            </View>
          </View>
          {item.description ? (
            <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
          accessible
          accessibilityLabel={`Delete pain entry for ${item.location}`}
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
              No pain entries recorded.{"\n"}Tap below to log pain levels.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Log pain entry"
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
            <ThemedText type="h3">Log Pain</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionLabel}>
                Pain Level: {painLevel}/10
              </ThemedText>
              <View style={styles.painScale}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setPainLevel(level)}
                    style={[
                      styles.painButton,
                      { 
                        backgroundColor: painLevel === level ? getPainColor(level) : theme.backgroundDefault,
                      },
                    ]}
                    accessible
                    accessibilityLabel={`Pain level ${level}`}
                    accessibilityState={{ selected: painLevel === level }}
                  >
                    <ThemedText
                      type="body"
                      style={{ color: painLevel === level ? "#FFFFFF" : theme.text }}
                    >
                      {level}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionLabel}>Location</ThemedText>
              <View style={styles.locationGrid}>
                {PAIN_LOCATIONS.map((location) => (
                  <Pressable
                    key={location}
                    onPress={() => setSelectedLocation(location)}
                    style={[
                      styles.locationButton,
                      { 
                        backgroundColor: selectedLocation === location ? theme.primary : theme.backgroundDefault,
                      },
                    ]}
                    accessible
                    accessibilityLabel={location}
                    accessibilityState={{ selected: selectedLocation === location }}
                  >
                    <ThemedText
                      type="body"
                      style={{ color: selectedLocation === location ? "#FFFFFF" : theme.text }}
                    >
                      {location}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionLabel}>Description (optional)</ThemedText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the pain..."
                placeholderTextColor={theme.textSecondary}
                multiline
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Pain description"
              />
            </View>

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
    gap: Spacing.sm,
  },
  painIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  painBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  painDetails: {
    flex: 1,
    gap: Spacing.xs,
  },
  description: {
    marginTop: Spacing.xs,
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  painScale: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  painButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  locationButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  input: {
    minHeight: 100,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 18,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
