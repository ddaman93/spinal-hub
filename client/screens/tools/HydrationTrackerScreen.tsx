import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, HydrationLog, generateId, formatDate, formatTime } from "@/lib/storage";

const QUICK_ADD_AMOUNTS = [
  { label: "8 oz", amount: 8 },
  { label: "12 oz", amount: 12 },
  { label: "16 oz", amount: 16 },
  { label: "24 oz", amount: 24 },
];

export default function HydrationTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [todayLogs, setTodayLogs] = useState<HydrationLog[]>([]);
  const [dailyGoal, setDailyGoal] = useState(64);

  const today = formatDate(new Date());

  const loadData = useCallback(async () => {
    const logs = await storage.hydration.getByDate(today);
    setTodayLogs(logs || []);
    const prefs = await storage.preferences.get();
    setDailyGoal(prefs.dailyWaterGoal);
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddWater = async (amount: number) => {
    const log: HydrationLog = {
      id: generateId(),
      amount,
      unit: "oz",
      timestamp: new Date().toISOString(),
      date: today,
    };
    await storage.hydration.add(log);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await storage.hydration.delete(id);
    await loadData();
  };

  const totalToday = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const progress = Math.min((totalToday / dailyGoal) * 100, 100);

  const renderLog = ({ item }: { item: HydrationLog }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={[styles.logCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.logContent}>
          <Feather name="droplet" size={20} color={theme.primary} />
          <ThemedText type="body">{item.amount} oz</ThemedText>
        </View>
        <View style={styles.logRight}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {formatTime(date)}
          </ThemedText>
          <Pressable
            onPress={() => handleDelete(item.id)}
            style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
            accessible
            accessibilityLabel={`Delete ${item.amount} ounce entry`}
            accessibilityRole="button"
          >
            <Feather name="x" size={16} color={theme.error} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText type="h3">Today's Progress</ThemedText>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {totalToday} / {dailyGoal} oz
          </ThemedText>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundDefault }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? theme.success : theme.primary,
              }
            ]} 
          />
        </View>
        
        {progress >= 100 ? (
          <ThemedText type="body" style={{ color: theme.success, textAlign: "center" }}>
            Great job! You've reached your goal!
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.quickAddSection}>
        <ThemedText type="h4" style={styles.sectionLabel}>Quick Add</ThemedText>
        <View style={styles.quickAddGrid}>
          {QUICK_ADD_AMOUNTS.map((item) => (
            <Pressable
              key={item.amount}
              onPress={() => handleAddWater(item.amount)}
              style={[styles.quickAddButton, { backgroundColor: theme.primary }]}
              accessible
              accessibilityLabel={`Add ${item.label} of water`}
              accessibilityRole="button"
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.historySection}>
        <ThemedText type="h4" style={styles.sectionLabel}>Today's Log</ThemedText>
        <FlatList
          data={todayLogs}
          renderItem={renderLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                No water logged today. Stay hydrated!
              </ThemedText>
            </View>
          }
        />
      </View>
    </ThemedView>
  );
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
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
  },
  quickAddSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  quickAddGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  quickAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minWidth: 100,
    minHeight: 56,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    gap: Spacing.sm,
  },
  logCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  logContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingTop: Spacing.xl,
    alignItems: "center",
  },
});
