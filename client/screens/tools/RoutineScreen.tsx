import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, RoutineTask, formatDate } from "@/lib/storage";
import { MainStackParamList } from "@/types/navigation";

type RoutineType = "morning" | "evening";

export default function RoutineScreen({ routineType }: { routineType: RoutineType }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const today = formatDate(new Date());

  const loadData = useCallback(async () => {
    await storage.routineTasks.initialize();
    const allTasks = await storage.routineTasks.getAll();
    const filteredTasks = (allTasks || [])
      .filter((t) => t.category === routineType)
      .sort((a, b) => a.order - b.order);
    setTasks(filteredTasks);

    const completions = await storage.routineCompletions.getByDate(today);
    setCompletedTaskIds(new Set(completions.map((c) => c.taskId)));
  }, [routineType, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTask = async (taskId: string) => {
    const isNowCompleted = await storage.routineCompletions.toggle(taskId, today);
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (isNowCompleted) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  const completedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const renderTask = ({ item }: { item: RoutineTask }) => {
    const isCompleted = completedTaskIds.has(item.id);
    return (
      <Pressable
        onPress={() => handleToggleTask(item.id)}
        style={[
          styles.taskCard,
          { backgroundColor: isCompleted ? theme.success : theme.backgroundDefault },
        ]}
        accessible
        accessibilityLabel={`${item.name}, ${isCompleted ? "completed" : "not completed"}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
      >
        <Feather
          name={isCompleted ? "check-circle" : "circle"}
          size={28}
          color={isCompleted ? "#FFFFFF" : theme.textSecondary}
        />
        <ThemedText
          type="body"
          style={[
            styles.taskText,
            { color: isCompleted ? "#FFFFFF" : theme.text },
            isCompleted && styles.completedText,
          ]}
        >
          {item.name}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText type="h3">
            {routineType === "morning" ? "Morning" : "Evening"} Routine
          </ThemedText>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {completedCount} / {tasks.length}
          </ThemedText>
        </View>

        <View style={[styles.progressBar, { backgroundColor: theme.backgroundDefault }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? theme.success : theme.primary,
              },
            ]}
          />
        </View>

        {progress >= 100 ? (
          <ThemedText type="body" style={{ color: theme.success, textAlign: "center" }}>
            All tasks completed!
          </ThemedText>
        ) : null}
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              No routine tasks set up yet.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

export function MorningRoutineScreen() {
  return <RoutineScreen routineType="morning" />;
}

export function EveningRoutineScreen() {
  return <RoutineScreen routineType="evening" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSection: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 80,
  },
  taskText: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  emptyContainer: {
    paddingTop: Spacing.xxl,
    alignItems: "center",
  },
});
