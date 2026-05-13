import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { MainStackParamList } from "@/types/navigation";

type Route = RouteProp<MainStackParamList, "HydrationTracker">;

type HydrationLog = {
  id: string;
  amount: number;
  unit: string;
  date: string;
  createdAt: string;
};

const QUICK_ADD_AMOUNTS = [
  { label: "200 ml", amount: 200 },
  { label: "250 ml", amount: 250 },
  { label: "350 ml", amount: 350 },
  { label: "500 ml", amount: 500 },
];

const DEFAULT_GOAL_ML = 2000;

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
}

export default function HydrationTrackerScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [todayLogs, setTodayLogs] = useState<HydrationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = todayDate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/hydration-logs?patientId=${encodeURIComponent(params.patientId)}&date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setTodayLogs(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [params.patientId, today]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAddWater = async (amount: number) => {
    const token = await getToken();
    await fetch(`${getApiUrl()}/api/health/hydration-logs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: params.patientId, amount, unit: "ml", date: today }),
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    const token = await getToken();
    await fetch(`${getApiUrl()}/api/health/hydration-logs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  const totalToday = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const progress = Math.min((totalToday / DEFAULT_GOAL_ML) * 100, 100);

  const renderLog = ({ item }: { item: HydrationLog }) => (
    <View style={[styles.logCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.logContent}>
        <Feather name="droplet" size={20} color={theme.primary} />
        <ThemedText type="body">{item.amount} ml</ThemedText>
      </View>
      <View style={styles.logRight}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatTime(item.createdAt)}
        </ThemedText>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
        >
          <Feather name="x" size={16} color={theme.error} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText type="h3">Today's Progress</ThemedText>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {totalToday} / {DEFAULT_GOAL_ML} ml
          </ThemedText>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundDefault }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: progress >= 100 ? theme.success : theme.primary },
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
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF" }}>{item.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.historySection}>
        <ThemedText type="h4" style={styles.sectionLabel}>Today's Log</ThemedText>
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <FlatList
            data={todayLogs}
            renderItem={renderLog}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  No water logged today. Stay hydrated!
                </ThemedText>
              </View>
            }
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressSection: { padding: Spacing.lg, gap: Spacing.md },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressBar: { height: 24, borderRadius: 12, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 12 },
  quickAddSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  sectionLabel: { marginBottom: Spacing.md },
  quickAddGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  quickAddButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.medium, minWidth: 100, minHeight: 56 },
  historySection: { flex: 1, paddingHorizontal: Spacing.lg },
  listContent: { gap: Spacing.sm },
  logCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.md, borderRadius: BorderRadius.medium },
  logContent: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  logRight: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  deleteButton: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingTop: Spacing.xl, alignItems: "center" },
});
