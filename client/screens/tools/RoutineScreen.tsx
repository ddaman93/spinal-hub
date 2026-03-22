import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, RoutineTask, formatDate, generateId } from "@/lib/storage";

/* ─── per-routine config ─── */

type RoutineType = "morning" | "evening";

const CONFIG = {
  morning: {
    accent: "#F59E0B",
    lightBg: "rgba(245,158,11,0.12)",
    icon: "sunrise" as const,
    label: "Morning Routine",
    greeting: "Good morning",
  },
  evening: {
    accent: "#818CF8",
    lightBg: "rgba(129,140,248,0.12)",
    icon: "moon" as const,
    label: "Evening Routine",
    greeting: "Good evening",
  },
};

/* ─── helpers ─── */

function formatHeaderDate(): string {
  return new Date().toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* ─── main screen ─── */

export default function RoutineScreen({ routineType }: { routineType: RoutineType }) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const cfg = CONFIG[routineType];

  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [newTaskName, setNewTaskName] = useState("");
  const inputRef = useRef<TextInput>(null);

  const today = formatDate(new Date());

  /* load */
  const loadData = useCallback(async () => {
    await storage.routineTasks.initialize();
    const allTasks = await storage.routineTasks.getAll();
    const filtered = (allTasks || [])
      .filter((t) => t.category === routineType)
      .sort((a, b) => a.order - b.order);
    setTasks(filtered);

    const completions = await storage.routineCompletions.getByDate(today);
    setCompletedTaskIds(new Set(completions.map((c) => c.taskId)));
  }, [routineType, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* handlers */
  const handleToggle = async (taskId: string) => {
    const isNowDone = await storage.routineCompletions.toggle(taskId, today);
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      isNowDone ? next.add(taskId) : next.delete(taskId);
      return next;
    });
  };

  const handleAdd = async () => {
    const name = newTaskName.trim();
    if (!name) return;
    const task: RoutineTask = {
      id: generateId(),
      name,
      category: routineType,
      order: tasks.length + 1,
    };
    await storage.routineTasks.add(task);
    setTasks((prev) => [...prev, task]);
    setNewTaskName("");
    inputRef.current?.blur();
  };

  const handleDelete = async (taskId: string) => {
    await storage.routineTasks.delete(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  /* derived */
  const completedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
  const total = tasks.length;
  const progress = total > 0 ? completedCount / total : 0;
  const allDone = total > 0 && completedCount === total;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight },
          ]}
        >
          {/* ── Header card ── */}
          <View style={[styles.headerCard, { backgroundColor: cfg.lightBg }]}>
            {/* icon + greeting row */}
            <View style={styles.headerTop}>
              <View style={[styles.iconCircle, { backgroundColor: cfg.accent }]}>
                <Feather name={cfg.icon} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.greeting, { color: cfg.accent }]}>
                  {cfg.greeting}
                </ThemedText>
                <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>
                  {formatHeaderDate()}
                </ThemedText>
              </View>
            </View>

            {/* progress numbers */}
            <View style={styles.progressNumbers}>
              <ThemedText style={[styles.progressFraction, { color: cfg.accent }]}>
                {completedCount}
                <ThemedText style={[styles.progressTotal, { color: theme.textSecondary }]}>
                  {" "}/ {total}
                </ThemedText>
              </ThemedText>
              <ThemedText style={[styles.progressLabel, { color: theme.textSecondary }]}>
                {allDone ? "All done! Great work." : "tasks completed"}
              </ThemedText>
            </View>

            {/* progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: theme.backgroundDefault }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: allDone ? "#16A34A" : cfg.accent,
                  },
                ]}
              />
            </View>
          </View>

          {/* ── Task list ── */}
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="list" size={40} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                No tasks yet — add one below.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.taskList}>
              {tasks.map((task) => {
                const done = completedTaskIds.has(task.id);
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => handleToggle(task.id)}
                    style={[
                      styles.taskCard,
                      {
                        backgroundColor: done
                          ? "rgba(22,163,74,0.07)"
                          : theme.backgroundDefault,
                        borderLeftColor: done ? "#16A34A" : cfg.accent,
                      },
                    ]}
                    accessible
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    accessibilityLabel={`${task.name}, ${done ? "completed" : "not completed"}`}
                  >
                    {/* check icon */}
                    <Feather
                      name={done ? "check-circle" : "circle"}
                      size={26}
                      color={done ? "#16A34A" : theme.textSecondary}
                    />

                    {/* task name */}
                    <ThemedText
                      style={[
                        styles.taskName,
                        { color: done ? theme.textSecondary : theme.text },
                        done && styles.taskDone,
                      ]}
                    >
                      {task.name}
                    </ThemedText>

                    {/* delete */}
                    <Pressable
                      onPress={() => handleDelete(task.id)}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${task.name}`}
                    >
                      <Feather name="trash-2" size={17} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>

        {/* ── Add task bar (sticky, above keyboard) ── */}
        <View
          style={[
            styles.addBar,
            {
              backgroundColor: theme.backgroundDefault,
              borderTopColor: theme.border ?? theme.backgroundDefault,
              paddingBottom: insets.bottom + Spacing.sm,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={newTaskName}
            onChangeText={setNewTaskName}
            placeholder="Add a new task…"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.addInput,
              {
                color: theme.text,
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border ?? "#E0E0E0",
              },
            ]}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            accessibilityLabel="New task name"
          />
          <Pressable
            onPress={handleAdd}
            disabled={!newTaskName.trim()}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: newTaskName.trim() ? cfg.accent : theme.textSecondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add task"
          >
            <Feather name="plus" size={22} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

export function MorningRoutineScreen() {
  return <RoutineScreen routineType="morning" />;
}

export function EveningRoutineScreen() {
  return <RoutineScreen routineType="evening" />;
}

/* ─── styles ─── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  /* header */
  headerCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dateText: {
    fontSize: 14,
    marginTop: 2,
  },
  progressNumbers: {
    gap: 2,
  },
  progressFraction: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 44,
  },
  progressTotal: {
    fontSize: 28,
    fontWeight: "400",
  },
  progressLabel: {
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  /* tasks */
  taskList: {
    gap: Spacing.sm,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    paddingLeft: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderLeftWidth: 4,
    minHeight: 64,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  taskName: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  taskDone: {
    textDecorationLine: "line-through",
  },

  /* empty */
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },

  /* add bar */
  addBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
