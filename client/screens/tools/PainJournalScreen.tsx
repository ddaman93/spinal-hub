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

type Route = RouteProp<MainStackParamList, "PainJournal">;

type PainEntry = {
  id: string;
  level: number;
  location: string;
  description?: string | null;
  authorName: string;
  createdAt: string;
};

const PAIN_LOCATIONS = [
  "Head", "Neck", "Shoulders", "Upper Back", "Lower Back",
  "Arms", "Hands", "Chest", "Abdomen", "Hips", "Legs", "Feet", "Other",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PainJournalScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<PainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [painLevel, setPainLevel] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState("Lower Back");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/pain-entries?patientId=${encodeURIComponent(params.patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setEntries(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      await fetch(`${getApiUrl()}/api/health/pain-entries`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: params.patientId,
          level: painLevel,
          location: selectedLocation,
          description: description || undefined,
        }),
      });
      setModalVisible(false);
      resetForm();
      await load();
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setPainLevel(5);
    setSelectedLocation("Lower Back");
    setDescription("");
  };

  const handleDelete = async (id: string) => {
    const token = await getToken();
    await fetch(`${getApiUrl()}/api/health/pain-entries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return theme.success;
    if (level <= 6) return theme.warning;
    return theme.error;
  };

  const renderEntry = ({ item }: { item: PainEntry }) => (
    <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.entryContent}>
        <View style={styles.painIndicator}>
          <View style={[styles.painBadge, { backgroundColor: getPainColor(item.level) }]}>
            <ThemedText type="h4" style={{ color: "#FFFFFF" }}>{item.level}</ThemedText>
          </View>
          <View style={styles.painDetails}>
            <ThemedText type="h4">{item.location}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.authorName} · {timeAgo(item.createdAt)}
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
      >
        <Feather name="trash-2" size={20} color={theme.error} />
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + 100 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="body" style={{ textAlign: "center" }}>
                No pain entries recorded.{"\n"}Tap below to log pain levels.
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

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Log Pain</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionLabel}>Pain Level: {painLevel}/10</ThemedText>
              <View style={styles.painScale}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setPainLevel(level)}
                    style={[styles.painButton, { backgroundColor: painLevel === level ? getPainColor(level) : theme.backgroundDefault }]}
                  >
                    <ThemedText type="body" style={{ color: painLevel === level ? "#FFFFFF" : theme.text }}>
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
                    style={[styles.locationButton, { backgroundColor: selectedLocation === location ? theme.primary : theme.backgroundDefault }]}
                  >
                    <ThemedText type="body" style={{ color: selectedLocation === location ? "#FFFFFF" : theme.text }}>
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
              />
            </View>

            <Button onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? "Saving…" : "Save Entry"}
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingTop: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  entryCard: { flexDirection: "row", padding: Spacing.lg, borderRadius: BorderRadius.medium, gap: Spacing.md, alignItems: "center" },
  entryContent: { flex: 1, gap: Spacing.sm },
  painIndicator: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  painBadge: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  painDetails: { flex: 1, gap: Spacing.xs },
  description: { marginTop: Spacing.xs },
  deleteButton: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingTop: Spacing.xxl, alignItems: "center" },
  fabContainer: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  fab: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  section: { marginBottom: Spacing.xl },
  sectionLabel: { marginBottom: Spacing.md },
  painScale: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  painButton: { width: 48, height: 48, borderRadius: BorderRadius.medium, justifyContent: "center", alignItems: "center" },
  locationGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  locationButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.medium },
  input: { minHeight: 100, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 18, textAlignVertical: "top" },
  saveButton: { marginTop: Spacing.lg },
});
