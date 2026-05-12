import React, { useState, useCallback, useRef } from "react";
import {
  View, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
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

type CareNote = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

// YYYY-MM-DD local
function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayKey(): string {
  return toDateKey(new Date().toISOString());
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d.toISOString());
}

function pillLabel(key: string): string {
  if (key === todayKey()) return "Today";
  if (key === yesterdayKey()) return "Yesterday";
  const d = new Date(key + "T12:00:00"); // noon local to avoid DST edge
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function HandoverNotesScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const stripRef = useRef<ScrollView>(null);

  // Map from YYYY-MM-DD → notes[], days sorted newest first
  const [notesByDay, setNotesByDay] = useState<Map<string, CareNote[]>>(new Map());
  const [days, setDays] = useState<string[]>([]); // sorted newest first
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function submitNote() {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/care/notes/${encodeURIComponent(params.patientId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ content: draft.trim() }),
        },
      );
      if (!res.ok) throw new Error();
      const newNote: CareNote = await res.json();
      const key = toDateKey(newNote.createdAt);
      setDraft("");
      setNotesByDay((prev) => {
        const next = new Map(prev);
        next.set(key, [newNote, ...(next.get(key) ?? [])]);
        return next;
      });
      setDays((prev) => prev.includes(key) ? prev : [key, ...prev]);
      setSelectedDay(key);
    } catch {
      Alert.alert("Error", "Could not save note.");
    } finally {
      setSubmitting(false);
    }
  }

  const visibleNotes = notesByDay.get(selectedDay) ?? [];

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* ── DAY STRIP ── */}
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
            <ThemedText type="caption" style={{ opacity: 0.4, marginHorizontal: Spacing.md }}>
              No entries yet
            </ThemedText>
          ) : (
            days.map((day) => {
              const active = day === selectedDay;
              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? theme.primary : theme.backgroundSecondary,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.pillText,
                      { color: active ? "#fff" : theme.textSecondary },
                    ]}
                  >
                    {pillLabel(day)}
                  </ThemedText>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={96}
      >
        {/* ── NOTES LIST ── */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
        ) : visibleNotes.length === 0 && selectedDay === "" ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={40} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            <ThemedText type="small" style={{ opacity: 0.4, marginTop: Spacing.md, textAlign: "center" }}>
              No handover notes yet.{"\n"}Add the first entry below.
            </ThemedText>
          </View>
        ) : visibleNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText type="caption" style={{ opacity: 0.4 }}>No notes for this day.</ThemedText>
          </View>
        ) : (
          <FlatList
            data={visibleNotes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: Spacing.md,
              paddingBottom: insets.bottom + 120,
              paddingHorizontal: Spacing.lg,
              gap: Spacing.sm,
            }}
            renderItem={({ item, index }) => {
              const isLast = index === visibleNotes.length - 1;
              return (
                <View style={styles.noteRow}>
                  {/* timeline */}
                  <View style={styles.timelineCol}>
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                    {!isLast && <View style={[styles.spine, { backgroundColor: theme.border }]} />}
                  </View>
                  <ElevatedCard style={styles.noteCard} padding={Spacing.md}>
                    <View style={styles.noteHeader}>
                      <View style={[styles.noteAvatar, { backgroundColor: theme.primary + "22" }]}>
                        <ThemedText style={{ fontSize: 12, fontWeight: "800", color: theme.primary }}>
                          {item.authorName.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="small" style={{ fontWeight: "600" }}>{item.authorName}</ThemedText>
                        <ThemedText type="caption" style={{ opacity: 0.45 }}>{formatTime(item.createdAt)}</ThemedText>
                      </View>
                    </View>
                    <ThemedText type="small" style={{ lineHeight: 20, opacity: 0.85, marginTop: Spacing.sm }}>
                      {item.content}
                    </ThemedText>
                  </ElevatedCard>
                </View>
              );
            }}
          />
        )}

        {/* ── COMPOSE BAR ── */}
        <View
          style={[
            styles.composeBar,
            {
              backgroundColor: theme.backgroundSecondary,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Note for ${params.patientName}…`}
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.composeInput, { color: theme.text }]}
          />
          <Pressable
            onPress={submitNote}
            disabled={submitting || !draft.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: draft.trim() ? theme.primary : theme.backgroundTertiary },
            ]}
          >
            {submitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Feather name="send" size={16} color={draft.trim() ? "#fff" : theme.textSecondary} />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  strip: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stripContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  noteRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  timelineCol: {
    alignItems: "center",
    width: 16,
    paddingTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spine: {
    flex: 1,
    width: 1,
    marginTop: 4,
  },
  noteCard: { flex: 1 },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  noteAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  composeBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  composeInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.small,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
});
