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

type Route = RouteProp<MainStackParamList, "BladderLog">;

type BladderEntry = {
  id: string;
  type: "catheterization" | "spontaneous" | "leak" | "accident";
  volumeMl?: number | null;
  notes?: string | null;
  authorName: string;
  createdAt: string;
};

const VOID_TYPES: { key: BladderEntry["type"]; label: string; color: string }[] = [
  { key: "catheterization", label: "Catheterization", color: "#007AFF" },
  { key: "spontaneous", label: "Spontaneous", color: "#22c55e" },
  { key: "leak", label: "Leak", color: "#f97316" },
  { key: "accident", label: "Accident", color: "#ef4444" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function BladderLogScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<BladderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<BladderEntry["type"]>("catheterization");
  const [volume, setVolume] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/bladder-logs?patientId=${encodeURIComponent(params.patientId)}`,
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
      await fetch(`${getApiUrl()}/api/health/bladder-logs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: params.patientId,
          type: selectedType,
          volumeMl: volume ? Number(volume) : undefined,
          notes: notes || undefined,
        }),
      });
      setModalVisible(false);
      resetForm();
      await load();
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setSelectedType("catheterization");
    setVolume("");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    const token = await getToken();
    await fetch(`${getApiUrl()}/api/health/bladder-logs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  const getTypeInfo = (type: BladderEntry["type"]) =>
    VOID_TYPES.find((t) => t.key === type) ?? VOID_TYPES[0];

  const renderEntry = ({ item }: { item: BladderEntry }) => {
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
            {item.volumeMl != null && (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.volumeMl} mL
              </ThemedText>
            )}
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.authorName} · {timeAgo(item.createdAt)}
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
        >
          <Feather name="trash-2" size={20} color={theme.error} />
        </Pressable>
      </View>
    );
  };

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
                No bladder events recorded yet.{"\n"}Tap + to log your first entry.
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
            <ThemedText type="h3">Log Bladder Event</ThemedText>
            <Pressable onPress={() => { setModalVisible(false); resetForm(); }}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>TYPE</ThemedText>
            <View style={styles.optionGrid}>
              {VOID_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setSelectedType(t.key)}
                  style={[styles.optionButton, { backgroundColor: selectedType === t.key ? t.color : theme.backgroundDefault }]}
                >
                  <ThemedText type="body" style={{ color: selectedType === t.key ? "#FFFFFF" : theme.text }}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>VOLUME mL (OPTIONAL)</ThemedText>
            <TextInput
              value={volume}
              onChangeText={setVolume}
              placeholder="e.g. 300"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              style={[styles.volumeInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>NOTES (OPTIONAL)</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

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
  listContent: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  entryCard: { flexDirection: "row", padding: Spacing.lg, borderRadius: BorderRadius.medium, gap: Spacing.md, alignItems: "center" },
  entryContent: { flex: 1, gap: Spacing.xs },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { paddingVertical: 2, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.small },
  notes: { marginTop: Spacing.xs, fontStyle: "italic" },
  deleteButton: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingTop: Spacing.xxl, alignItems: "center" },
  fabContainer: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  fab: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  modalContainer: { flex: 1, paddingTop: Spacing.xxl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  sectionLabel: { marginBottom: Spacing.sm, fontWeight: "600", letterSpacing: 0.5 },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  optionButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.medium },
  volumeInput: { height: 48, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 16, marginBottom: Spacing.xl },
  notesInput: { height: 100, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 16, textAlignVertical: "top", marginBottom: Spacing.xl },
  saveButton: { marginTop: Spacing.lg },
});
