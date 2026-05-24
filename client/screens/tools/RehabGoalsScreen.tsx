import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, ActivityIndicator,
  Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type Route = RouteProp<MainStackParamList, "RehabGoals">;

type Goal = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  achievedAt: string | null;
  progressNote: string | null;
  progressUpdatedAt: string | null;
  progressUpdatedBy: string | null;
  createdByName: string;
  createdAt: string;
};

const CATEGORIES = [
  { key: "mobility",      label: "Mobility",      icon: "navigation",  color: "#4A90D9" },
  { key: "self_care",     label: "Self Care",     icon: "heart",       color: "#E91E63" },
  { key: "communication", label: "Communication", icon: "message-circle", color: "#9C27B0" },
  { key: "community",     label: "Community",     icon: "users",       color: "#00BCD4" },
  { key: "other",         label: "Other",         icon: "target",      color: "#FF9800" },
];

const STATUSES = [
  { key: "active",        label: "In Progress", color: "#4A90D9" },
  { key: "achieved",      label: "Achieved",    color: "#00E676" },
  { key: "on_hold",       label: "On Hold",     color: "#FF9800" },
  { key: "discontinued",  label: "Discontinued",color: "#9E9E9E" },
];

function categoryFor(key: string) { return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]; }
function statusFor(key: string)   { return STATUSES.find((s) => s.key === key) ?? STATUSES[0]; }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Goal card
// ---------------------------------------------------------------------------

function GoalCard({ goal, onStatusChange, onProgressEdit, onDelete, theme }: {
  goal: Goal;
  onStatusChange: (id: string, status: string) => void;
  onProgressEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  theme: any;
}) {
  const cat = categoryFor(goal.category);
  const st = statusFor(goal.status);

  return (
    <ElevatedCard padding={Spacing.md} style={styles.goalCard}>
      {/* Header row */}
      <View style={styles.goalHeader}>
        <View style={[styles.catIcon, { backgroundColor: cat.color + "22" }]}>
          <Feather name={cat.icon as any} size={16} color={cat.color} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.goalTitle} numberOfLines={2}>{goal.title}</ThemedText>
          <ThemedText type="caption" style={{ color: cat.color, fontWeight: "600", fontSize: 10, marginTop: 1 }}>
            {cat.label}
          </ThemedText>
        </View>
        <Pressable onPress={() => onDelete(goal.id)} hitSlop={12}>
          <Feather name="trash-2" size={16} color={theme.textSecondary} style={{ opacity: 0.4 }} />
        </Pressable>
      </View>

      {goal.description ? (
        <ThemedText type="caption" style={{ opacity: 0.65, marginTop: 6, lineHeight: 18 }}>
          {goal.description}
        </ThemedText>
      ) : null}

      {/* Target date */}
      {goal.targetDate ? (
        <View style={styles.dateRow}>
          <Feather name="calendar" size={12} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ opacity: 0.55, marginLeft: 5 }}>
            Target: {fmtDate(goal.targetDate + "T12:00:00")}
          </ThemedText>
        </View>
      ) : null}

      {/* Progress note */}
      {goal.progressNote ? (
        <View style={[styles.progressBox, { borderColor: theme.border, backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ opacity: 0.8, lineHeight: 18 }}>{goal.progressNote}</ThemedText>
          {goal.progressUpdatedAt ? (
            <ThemedText type="caption" style={{ opacity: 0.4, marginTop: 4, fontSize: 10 }}>
              {goal.progressUpdatedBy} · {fmtDate(goal.progressUpdatedAt)}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {/* Status pills + actions */}
      <View style={styles.goalFooter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: 6, paddingRight: 8 }}>
            {STATUSES.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => goal.status !== s.key && onStatusChange(goal.id, s.key)}
                style={[
                  styles.statusPill,
                  { borderColor: s.color, backgroundColor: goal.status === s.key ? s.color : "transparent" },
                ]}
              >
                <ThemedText style={[styles.statusPillText, { color: goal.status === s.key ? "#fff" : s.color }]}>
                  {s.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <Pressable onPress={() => onProgressEdit(goal)} style={styles.progressBtn}>
          <Feather name="edit-3" size={14} color={theme.primary} />
        </Pressable>
      </View>
    </ElevatedCard>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function RehabGoalsScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Add modal
  const [addVisible, setAddVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("mobility");
  const [newTarget, setNewTarget] = useState("");
  const [saving, setSaving] = useState(false);

  // Progress edit modal
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [progressText, setProgressText] = useState("");
  const [progressSaving, setProgressSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const pid = encodeURIComponent(params.patientId);
      const res = await fetch(`${getApiUrl()}/api/health/rehab-goals?patientId=${pid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setGoals(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/rehab-goals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: params.patientId,
          category: newCategory,
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          targetDate: newTarget.trim() || null,
        }),
      });
      if (res.ok) {
        const goal = await res.json();
        setGoals((g) => [goal, ...g]);
        setAddVisible(false);
        setNewTitle(""); setNewDesc(""); setNewTarget(""); setNewCategory("mobility");
      }
    } catch { /* silent */ } finally { setSaving(false); }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/rehab-goals/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals((g) => g.map((x) => x.id === id ? updated : x));
      }
    } catch { /* silent */ }
  }

  async function handleProgressSave() {
    if (!progressGoal) return;
    setProgressSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/rehab-goals/${progressGoal.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ progressNote: progressText.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals((g) => g.map((x) => x.id === progressGoal.id ? updated : x));
        setProgressGoal(null);
      }
    } catch { /* silent */ } finally { setProgressSaving(false); }
  }

  function handleDelete(id: string) {
    Alert.alert("Delete goal?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          const token = await getToken();
          const res = await fetch(`${getApiUrl()}/api/health/rehab-goals/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) setGoals((g) => g.filter((x) => x.id !== id));
        },
      },
    ]);
  }

  const filtered = activeCategory ? goals.filter((g) => g.category === activeCategory) : goals;
  const achieved = filtered.filter((g) => g.status === "achieved").length;
  const active = filtered.filter((g) => g.status === "active").length;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Summary strip ── */}
        <View style={styles.summaryStrip}>
          <View style={[styles.summaryChip, { backgroundColor: "#4A90D9" + "22" }]}>
            <ThemedText style={{ fontSize: 18, fontWeight: "800", color: "#4A90D9" }}>{active}</ThemedText>
            <ThemedText type="caption" style={{ color: "#4A90D9", fontWeight: "600", fontSize: 10 }}>IN PROGRESS</ThemedText>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: "#00E676" + "22" }]}>
            <ThemedText style={{ fontSize: 18, fontWeight: "800", color: "#00E676" }}>{achieved}</ThemedText>
            <ThemedText type="caption" style={{ color: "#00E676", fontWeight: "600", fontSize: 10 }}>ACHIEVED</ThemedText>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: theme.border + "44" }]}>
            <ThemedText style={{ fontSize: 18, fontWeight: "800" }}>{goals.length}</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.5, fontWeight: "600", fontSize: 10 }}>TOTAL GOALS</ThemedText>
          </View>
        </View>

        {/* ── Category filter ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 8 }}>
          <Pressable onPress={() => setActiveCategory(null)} style={[styles.catChip, { borderColor: activeCategory === null ? theme.primary : theme.border, backgroundColor: activeCategory === null ? theme.primary + "22" : "transparent" }]}>
            <ThemedText type="caption" style={{ fontWeight: "600", color: activeCategory === null ? theme.primary : theme.textSecondary }}>All</ThemedText>
          </Pressable>
          {CATEGORIES.map((c) => (
            <Pressable key={c.key} onPress={() => setActiveCategory(c.key === activeCategory ? null : c.key)}
              style={[styles.catChip, { borderColor: activeCategory === c.key ? c.color : theme.border, backgroundColor: activeCategory === c.key ? c.color + "22" : "transparent" }]}>
              <Feather name={c.icon as any} size={12} color={activeCategory === c.key ? c.color : theme.textSecondary} />
              <ThemedText type="caption" style={{ fontWeight: "600", marginLeft: 4, color: activeCategory === c.key ? c.color : theme.textSecondary }}>{c.label}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Goals list ── */}
        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
          ) : filtered.length === 0 ? (
            <ThemedText type="caption" style={{ textAlign: "center", opacity: 0.4, marginTop: Spacing.xl }}>
              {goals.length === 0 ? "No goals added yet. Tap + to add the first goal." : "No goals in this category."}
            </ThemedText>
          ) : (
            filtered.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onStatusChange={handleStatusChange}
                onProgressEdit={(goal) => { setProgressGoal(goal); setProgressText(goal.progressNote ?? ""); }}
                onDelete={handleDelete}
                theme={theme}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable onPress={() => setAddVisible(true)} style={[styles.fab, { backgroundColor: theme.primary }]}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      {/* ── Add modal ── */}
      <Modal visible={addVisible} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setAddVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
          <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">New Rehab Goal</ThemedText>
              <Pressable onPress={() => setAddVisible(false)}>
                <Feather name="x" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ThemedText type="caption" style={styles.fieldLabel}>CATEGORY</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c.key} onPress={() => setNewCategory(c.key)}
                    style={[styles.catChip, { borderColor: newCategory === c.key ? c.color : theme.border, backgroundColor: newCategory === c.key ? c.color + "22" : "transparent" }]}>
                    <Feather name={c.icon as any} size={12} color={newCategory === c.key ? c.color : theme.textSecondary} />
                    <ThemedText type="caption" style={{ fontWeight: "600", marginLeft: 4, color: newCategory === c.key ? c.color : theme.textSecondary }}>{c.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <ThemedText type="caption" style={styles.fieldLabel}>GOAL TITLE *</ThemedText>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Independent transfers to wheelchair"
              placeholderTextColor={theme.textSecondary + "88"}
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              multiline
            />

            <ThemedText type="caption" style={styles.fieldLabel}>DESCRIPTION / CRITERIA</ThemedText>
            <TextInput
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="How will we know this goal is achieved?"
              placeholderTextColor={theme.textSecondary + "88"}
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border, height: 80 }]}
              multiline
            />

            <ThemedText type="caption" style={styles.fieldLabel}>TARGET DATE (YYYY-MM-DD, optional)</ThemedText>
            <TextInput
              value={newTarget}
              onChangeText={setNewTarget}
              placeholder="2026-06-30"
              placeholderTextColor={theme.textSecondary + "88"}
              keyboardType="numbers-and-punctuation"
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
            />

            <Pressable
              onPress={handleAdd}
              disabled={saving || !newTitle.trim()}
              style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving || !newTitle.trim() ? 0.5 : 1 }]}
            >
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Add Goal</ThemedText>}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Progress edit modal ── */}
      <Modal visible={!!progressGoal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setProgressGoal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.backgroundRoot, padding: Spacing.lg }}>
          <View style={styles.modalHeader}>
            <ThemedText type="h4">Progress Note</ThemedText>
            <Pressable onPress={() => setProgressGoal(null)}>
              <Feather name="x" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>
          {progressGoal ? (
            <ThemedText type="caption" style={{ opacity: 0.6, marginBottom: Spacing.md }}>{progressGoal.title}</ThemedText>
          ) : null}
          <TextInput
            value={progressText}
            onChangeText={setProgressText}
            placeholder="Document current progress, what's working, what's changed…"
            placeholderTextColor={theme.textSecondary + "88"}
            style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border, height: 140, flex: 0 }]}
            multiline
            autoFocus
          />
          <Pressable
            onPress={handleProgressSave}
            disabled={progressSaving}
            style={[styles.saveBtn, { backgroundColor: theme.primary, marginTop: Spacing.md, opacity: progressSaving ? 0.5 : 1 }]}
          >
            {progressSaving ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Save Progress</ThemedText>}
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  summaryStrip: { flexDirection: "row", gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  summaryChip: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12 },
  catScroll: { marginBottom: Spacing.md },
  catChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  goalCard: { gap: Spacing.xs },
  goalHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  catIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  goalTitle: { fontWeight: "700", fontSize: 14, lineHeight: 19 },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  progressBox: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8 },
  goalFooter: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1.5 },
  statusPillText: { fontSize: 11, fontWeight: "600" },
  progressBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  fab: { position: "absolute", bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, opacity: 0.5, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 4 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: Spacing.md },
});
