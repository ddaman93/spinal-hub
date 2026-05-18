import React, { useState, useCallback, useRef } from "react";
import {
  View, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal,
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

type Route = RouteProp<MainStackParamList, "HandoverNotes">;

type NoteRead = { readerId: string; readerName: string; readAt: string };

type CareNote = {
  id: string;
  authorName: string;
  noteType: "free_text" | "isbar";
  content: string;
  shiftType: string | null;
  situation: string | null;
  background: string | null;
  assessment: string | null;
  recommendation: string | null;
  createdAt: string;
  reads: NoteRead[];
};

const SHIFT_TYPES = [
  { key: "morning",   label: "Morning",   color: "#f59e0b" },
  { key: "afternoon", label: "Afternoon", color: "#f97316" },
  { key: "evening",   label: "Evening",   color: "#8B5CF6" },
  { key: "night",     label: "Night",     color: "#1e40af" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function todayKey(): string { return toDateKey(new Date().toISOString()); }
function yesterdayKey(): string {
  const d = new Date(); d.setDate(d.getDate() - 1); return toDateKey(d.toISOString());
}
function pillLabel(key: string): string {
  if (key === todayKey()) return "Today";
  if (key === yesterdayKey()) return "Yesterday";
  return new Date(key + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function groupByDay(notes: CareNote[]): Map<string, CareNote[]> {
  const map = new Map<string, CareNote[]>();
  for (const note of notes) {
    const key = toDateKey(note.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(note);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Note card
// ---------------------------------------------------------------------------

function NoteCard({ item, isLast, myId, onRead, theme }: {
  item: CareNote; isLast: boolean; myId: string; onRead: (id: string) => void; theme: any;
}) {
  const shift = SHIFT_TYPES.find((s) => s.key === item.shiftType);
  const isIsbar = item.noteType === "isbar";
  const iReadIt = item.reads.some((r) => r.readerId === myId);
  const authorIsMe = false; // server-side we don't have myId easily — mark read on open

  return (
    <View style={styles.noteRow}>
      <View style={styles.timelineCol}>
        <View style={[styles.dot, { backgroundColor: isIsbar ? "#007AFF" : theme.primary }]} />
        {!isLast && <View style={[styles.spine, { backgroundColor: theme.border }]} />}
      </View>
      <ElevatedCard style={styles.noteCard} padding={Spacing.md}>
        {/* Header */}
        <View style={styles.noteHeader}>
          <View style={[styles.noteAvatar, { backgroundColor: isIsbar ? "#007AFF22" : theme.primary + "22" }]}>
            <ThemedText style={{ fontSize: 12, fontWeight: "800", color: isIsbar ? "#007AFF" : theme.primary }}>
              {item.authorName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="small" style={{ fontWeight: "600" }}>{item.authorName}</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.45 }}>{formatTime(item.createdAt)}</ThemedText>
          </View>
          <View style={{ gap: 4, alignItems: "flex-end" }}>
            {isIsbar && (
              <View style={styles.isbarBadge}>
                <ThemedText style={styles.isbarBadgeText}>ISBAR</ThemedText>
              </View>
            )}
            {shift && (
              <View style={[styles.shiftBadge, { backgroundColor: shift.color + "22" }]}>
                <ThemedText style={[styles.shiftBadgeText, { color: shift.color }]}>{shift.label}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        {isIsbar ? (
          <View style={styles.isbarBody}>
            {item.situation ? (
              <IsbarRow label="S" color="#ef4444" text={item.situation} />
            ) : null}
            {item.background ? (
              <IsbarRow label="B" color="#f97316" text={item.background} />
            ) : null}
            {item.assessment ? (
              <IsbarRow label="A" color="#8B5CF6" text={item.assessment} />
            ) : null}
            {item.recommendation ? (
              <IsbarRow label="R" color="#22c55e" text={item.recommendation} />
            ) : null}
          </View>
        ) : (
          <ThemedText type="small" style={{ lineHeight: 20, opacity: 0.85, marginTop: Spacing.sm }}>
            {item.content}
          </ThemedText>
        )}

        {/* Read receipts */}
        {item.reads.length > 0 && (
          <View style={styles.readRow}>
            <Feather name="check-circle" size={11} color={theme.textSecondary} style={{ opacity: 0.5 }} />
            <ThemedText style={[styles.readText, { color: theme.textSecondary }]}>
              Read by {item.reads.map((r) => r.readerName.split(" ")[0]).join(", ")}
            </ThemedText>
          </View>
        )}

        {/* Mark as read button */}
        {!iReadIt && (
          <Pressable onPress={() => onRead(item.id)} style={styles.markReadBtn}>
            <Feather name="check" size={12} color="#007AFF" />
            <ThemedText style={styles.markReadText}>Mark as read</ThemedText>
          </Pressable>
        )}
      </ElevatedCard>
    </View>
  );
}

function IsbarRow({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <View style={styles.isbarRow}>
      <View style={[styles.isbarLabel, { backgroundColor: color }]}>
        <ThemedText style={styles.isbarLabelText}>{label}</ThemedText>
      </View>
      <ThemedText type="small" style={{ flex: 1, lineHeight: 19, opacity: 0.85 }}>{text}</ThemedText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function HandoverNotesScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const stripRef = useRef<ScrollView>(null);

  const [notesByDay, setNotesByDay] = useState<Map<string, CareNote[]>>(new Map());
  const [days, setDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Free-text compose
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ISBAR modal
  const [isbarVisible, setIsbarVisible] = useState(false);
  const [shiftType, setShiftType] = useState("morning");
  const [situation, setSituation] = useState("");
  const [background, setBackground] = useState("");
  const [assessment, setAssessment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [savingIsbar, setSavingIsbar] = useState(false);

  // Fake "my" id for read receipt logic — we use authorId comparison
  const [myId] = useState(() => ""); // populated after auth; read receipts still work server-side

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/care/notes/${encodeURIComponent(params.patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const notes: CareNote[] = await res.json();
        const map = groupByDay(notes);
        const sortedDays = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
        setNotesByDay(map);
        setDays(sortedDays);
        setSelectedDay((prev) => prev && map.has(prev) ? prev : (sortedDays[0] ?? ""));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function submitFreeText() {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/care/notes/${encodeURIComponent(params.patientId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ content: draft.trim(), noteType: "free_text" }),
        },
      );
      if (!res.ok) throw new Error();
      const newNote: CareNote = await res.json();
      addNoteToState(newNote);
      setDraft("");
    } catch {
      Alert.alert("Error", "Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitIsbar() {
    if (!situation.trim()) { Alert.alert("Required", "Situation field is required."); return; }
    setSavingIsbar(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/care/notes/${encodeURIComponent(params.patientId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            noteType: "isbar",
            shiftType,
            situation: situation.trim(),
            background: background.trim() || null,
            assessment: assessment.trim() || null,
            recommendation: recommendation.trim() || null,
          }),
        },
      );
      if (!res.ok) throw new Error();
      const newNote: CareNote = await res.json();
      addNoteToState(newNote);
      resetIsbar();
      setIsbarVisible(false);
    } catch {
      Alert.alert("Error", "Could not save handover.");
    } finally {
      setSavingIsbar(false);
    }
  }

  function addNoteToState(note: CareNote) {
    const key = toDateKey(note.createdAt);
    setNotesByDay((prev) => {
      const next = new Map(prev);
      next.set(key, [note, ...(next.get(key) ?? [])]);
      return next;
    });
    setDays((prev) => prev.includes(key) ? prev : [key, ...prev]);
    setSelectedDay(key);
  }

  function resetIsbar() {
    setSituation(""); setBackground(""); setAssessment(""); setRecommendation("");
    setShiftType("morning");
  }

  async function handleMarkRead(noteId: string) {
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/care/notes/${noteId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const read: NoteRead & { readerId: string } = await res.json();
      setNotesByDay((prev) => {
        const next = new Map(prev);
        for (const [day, notes] of next) {
          next.set(day, notes.map((n) =>
            n.id === noteId
              ? { ...n, reads: [...n.reads.filter((r) => r.readerId !== read.readerId), { readerId: read.readerId, readerName: read.readerName, readAt: String(read.readAt) }] }
              : n
          ));
        }
        return next;
      });
    } catch { /* silent */ }
  }

  const visibleNotes = notesByDay.get(selectedDay) ?? [];

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Day strip */}
      <View style={[styles.strip, { borderBottomColor: theme.border }]}>
        <ScrollView
          ref={stripRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
        >
          {loading && days.length === 0 ? (
            <ActivityIndicator color={theme.primary} style={{ marginHorizontal: Spacing.md }} />
          ) : days.length === 0 ? (
            <ThemedText type="caption" style={{ opacity: 0.4, marginHorizontal: Spacing.md }}>No entries yet</ThemedText>
          ) : (
            days.map((day) => {
              const active = day === selectedDay;
              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[styles.pill, { backgroundColor: active ? theme.primary : theme.backgroundSecondary, borderColor: active ? theme.primary : theme.border }]}
                >
                  <ThemedText style={[styles.pillText, { color: active ? "#fff" : theme.textSecondary }]}>
                    {pillLabel(day)}
                  </ThemedText>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={96}>
        {/* Notes list */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
        ) : visibleNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={40} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            <ThemedText type="small" style={{ opacity: 0.4, marginTop: Spacing.md, textAlign: "center" }}>
              {selectedDay === "" ? "No handover notes yet.\nAdd the first entry below." : "No notes for this day."}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={visibleNotes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: Spacing.md, paddingBottom: insets.bottom + 140, paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
            renderItem={({ item, index }) => (
              <NoteCard
                item={item}
                isLast={index === visibleNotes.length - 1}
                myId={myId}
                onRead={handleMarkRead}
                theme={theme}
              />
            )}
          />
        )}

        {/* Compose bar */}
        <View style={[styles.composeBar, { backgroundColor: theme.backgroundSecondary, borderTopColor: theme.border, paddingBottom: insets.bottom + 8 }]}>
          <Pressable
            onPress={() => setIsbarVisible(true)}
            style={[styles.isbarBtn, { backgroundColor: "#007AFF" }]}
          >
            <ThemedText style={styles.isbarBtnText}>ISBAR</ThemedText>
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Quick note for ${params.patientName}…`}
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.composeInput, { color: theme.text }]}
          />
          <Pressable
            onPress={submitFreeText}
            disabled={submitting || !draft.trim()}
            style={[styles.sendBtn, { backgroundColor: draft.trim() ? theme.primary : theme.backgroundTertiary }]}
          >
            {submitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Feather name="send" size={16} color={draft.trim() ? "#fff" : theme.textSecondary} />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* ISBAR modal */}
      <Modal visible={isbarVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setIsbarVisible(false); resetIsbar(); }}>
        <View style={[styles.isbarModal, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.isbarModalHeader}>
            <ThemedText type="h3">ISBAR Handover</ThemedText>
            <Pressable onPress={() => { setIsbarVisible(false); resetIsbar(); }}>
              <ThemedText style={{ color: "#007AFF", fontSize: 16 }}>Cancel</ThemedText>
            </Pressable>
          </View>
          <ThemedText type="caption" style={{ paddingHorizontal: Spacing.xl, opacity: 0.5, marginBottom: Spacing.lg }}>
            Structured clinical handover — {params.patientName}
          </ThemedText>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 120 }}>
            {/* Shift */}
            <ThemedText style={[styles.isbarFieldLabel, { color: theme.textSecondary }]}>SHIFT</ThemedText>
            <View style={styles.shiftRow}>
              {SHIFT_TYPES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setShiftType(s.key)}
                  style={[styles.shiftPill, shiftType === s.key && { backgroundColor: s.color, borderColor: s.color }]}
                >
                  <ThemedText style={{ fontSize: 13, fontWeight: "700", color: shiftType === s.key ? "#fff" : theme.text }}>
                    {s.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* I — Identification is the author + patient, auto-filled */}
            <View style={[styles.identRow, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.isbarLabel, { backgroundColor: "#6B7280" }]}>
                <ThemedText style={styles.isbarLabelText}>I</ThemedText>
              </View>
              <ThemedText type="caption" style={{ flex: 1, opacity: 0.6 }}>
                Identification auto-filled — patient: {params.patientName}
              </ThemedText>
            </View>

            {/* S */}
            <IsbarField
              letter="S" color="#ef4444" label="Situation *"
              placeholder="What is happening right now? Current status, concerns, reason for handover…"
              value={situation} onChange={setSituation} theme={theme}
            />

            {/* B */}
            <IsbarField
              letter="B" color="#f97316" label="Background"
              placeholder="Relevant history, medications given, procedures completed today…"
              value={background} onChange={setBackground} theme={theme}
            />

            {/* A */}
            <IsbarField
              letter="A" color="#8B5CF6" label="Assessment"
              placeholder="Your clinical assessment — e.g. stable, deteriorating, skin intact, mood observed…"
              value={assessment} onChange={setAssessment} theme={theme}
            />

            {/* R */}
            <IsbarField
              letter="R" color="#22c55e" label="Recommendation"
              placeholder="What needs to happen next shift? Follow-up tasks, escalation needed, goals…"
              value={recommendation} onChange={setRecommendation} theme={theme}
            />
          </ScrollView>

          {/* Save button */}
          <View style={[styles.isbarFooter, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundDefault, borderTopColor: theme.border }]}>
            <Pressable
              onPress={submitIsbar}
              disabled={savingIsbar || !situation.trim()}
              style={[styles.isbarSaveBtn, { backgroundColor: situation.trim() ? "#007AFF" : theme.backgroundTertiary }]}
            >
              {savingIsbar
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Feather name="check" size={18} color="#fff" />
                    <ThemedText style={styles.isbarSaveBtnText}>Submit Handover</ThemedText>
                  </>
                )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// ISBAR field component
// ---------------------------------------------------------------------------

function IsbarField({ letter, color, label, placeholder, value, onChange, theme }: {
  letter: string; color: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; theme: any;
}) {
  return (
    <View style={styles.isbarFieldWrapper}>
      <View style={styles.isbarFieldHeader}>
        <View style={[styles.isbarLabel, { backgroundColor: color }]}>
          <ThemedText style={styles.isbarLabelText}>{letter}</ThemedText>
        </View>
        <ThemedText style={[styles.isbarFieldLabel, { color: theme.textSecondary, marginBottom: 0 }]}>{label}</ThemedText>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.isbarTextInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: value.trim() ? color : "transparent" }]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  strip: { borderBottomWidth: StyleSheet.hairlineWidth },
  stripContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: "600" },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },

  noteRow: { flexDirection: "row", gap: Spacing.sm },
  timelineCol: { alignItems: "center", width: 16, paddingTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  spine: { flex: 1, width: 1, marginTop: 4 },
  noteCard: { flex: 1 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.xs },
  noteAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },

  isbarBadge: { backgroundColor: "#007AFF22", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  isbarBadgeText: { fontSize: 9, fontWeight: "800", color: "#007AFF", letterSpacing: 0.5 },
  shiftBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  shiftBadgeText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },

  isbarBody: { marginTop: Spacing.sm, gap: 6 },
  isbarRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  isbarLabel: { width: 20, height: 20, borderRadius: 4, alignItems: "center", justifyContent: "center", marginTop: 1 },
  isbarLabelText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  readRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: Spacing.sm, opacity: 0.6 },
  readText: { fontSize: 11 },
  markReadBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, alignSelf: "flex-start" },
  markReadText: { fontSize: 12, color: "#007AFF", fontWeight: "600" },

  composeBar: {
    flexDirection: "row", alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm, paddingHorizontal: Spacing.md, gap: Spacing.sm,
  },
  isbarBtn: {
    height: 40, paddingHorizontal: 10, borderRadius: BorderRadius.small,
    alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm,
  },
  isbarBtnText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  composeInput: { flex: 1, fontSize: 15, maxHeight: 120, paddingVertical: Spacing.sm, paddingTop: Spacing.sm },
  sendBtn: { width: 40, height: 40, borderRadius: BorderRadius.small, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },

  // ISBAR modal
  isbarModal: { flex: 1, paddingTop: Spacing.xl },
  isbarModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.xs },
  shiftRow: { flexDirection: "row", gap: 6, marginBottom: Spacing.lg },
  shiftPill: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: BorderRadius.small, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.1)" },
  identRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: Spacing.sm, borderRadius: BorderRadius.small, marginBottom: Spacing.md },
  isbarFieldWrapper: { marginBottom: Spacing.md },
  isbarFieldHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  isbarFieldLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  isbarTextInput: {
    borderRadius: BorderRadius.medium, padding: Spacing.md,
    fontSize: 14, textAlignVertical: "top", minHeight: 90,
    borderWidth: 1.5,
  },
  isbarFooter: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  isbarSaveBtn: {
    height: 54, borderRadius: BorderRadius.medium,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  isbarSaveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
