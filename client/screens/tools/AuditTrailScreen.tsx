import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type Route = RouteProp<MainStackParamList, "AuditTrail">;

type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Action → icon + color
// ---------------------------------------------------------------------------

const ACTION_META: Record<string, { icon: string; color: string }> = {
  administered:    { icon: "check-circle",  color: "#00E676" },
  omitted:         { icon: "x-circle",      color: "#FF7043" },
  achieved:        { icon: "award",          color: "#FFD700" },
  assessed:        { icon: "eye",            color: "#4A90D9" },
  status_changed:  { icon: "refresh-cw",    color: "#FF9800" },
  created:         { icon: "file-plus",      color: "#9C27B0" },
  updated:         { icon: "edit-2",         color: "#29B6F6" },
  deleted:         { icon: "trash-2",        color: "#9E9E9E" },
};

function metaFor(action: string) {
  return ACTION_META[action] ?? { icon: "activity", color: "#4A90D9" };
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function toDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AuditTrailScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const pid = encodeURIComponent(params.patientId);
      const res = await fetch(`${getApiUrl()}/api/audit/${pid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLogs(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Group by day
  const grouped: { dateKey: string; entries: AuditLog[] }[] = [];
  for (const log of logs) {
    const key = toDateKey(log.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.dateKey === key) {
      last.entries.push(log);
    } else {
      grouped.push({ dateKey: key, entries: [log] });
    }
  }

  function dayLabel(key: string) {
    const today = toDateKey(new Date().toISOString());
    const yesterday = toDateKey(new Date(Date.now() - 86400000).toISOString());
    if (key === today) return "Today";
    if (key === yesterday) return "Yesterday";
    return new Date(key + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
        ) : logs.length === 0 ? (
          <ThemedText type="caption" style={{ textAlign: "center", opacity: 0.4, marginTop: Spacing.xl, paddingHorizontal: Spacing.lg }}>
            No audit events yet. Events are recorded when medications are administered, wound checks are added, care notes are written, or goals are achieved.
          </ThemedText>
        ) : (
          grouped.map(({ dateKey, entries }) => (
            <View key={dateKey} style={styles.dayGroup}>
              {/* Day header */}
              <View style={styles.dayHeader}>
                <View style={[styles.dayDot, { backgroundColor: theme.primary }]} />
                <ThemedText type="caption" style={[styles.dayLabel, { color: theme.textSecondary }]}>
                  {dayLabel(dateKey).toUpperCase()}
                </ThemedText>
              </View>

              {/* Entries */}
              <View style={styles.entries}>
                {entries.map((log, i) => {
                  const meta = metaFor(log.action);
                  const { date, time } = fmtDateTime(log.createdAt);
                  const isLast = i === entries.length - 1;
                  return (
                    <View key={log.id} style={styles.entryRow}>
                      {/* Timeline line */}
                      <View style={styles.timelineCol}>
                        <View style={[styles.dot, { backgroundColor: meta.color }]} />
                        {!isLast && <View style={[styles.line, { backgroundColor: theme.border }]} />}
                      </View>

                      {/* Card */}
                      <ElevatedCard style={styles.entryCard} padding={Spacing.sm}>
                        <View style={styles.entryHeader}>
                          <View style={[styles.iconBadge, { backgroundColor: meta.color + "22" }]}>
                            <Feather name={meta.icon as any} size={13} color={meta.color} />
                          </View>
                          <ThemedText type="small" style={{ flex: 1, fontWeight: "600", fontSize: 13, marginLeft: 8 }}>
                            {log.summary}
                          </ThemedText>
                        </View>
                        <View style={styles.entryMeta}>
                          <ThemedText type="caption" style={{ opacity: 0.5, fontSize: 11 }}>
                            {log.actorName}
                          </ThemedText>
                          <ThemedText type="caption" style={{ opacity: 0.4, fontSize: 11 }}>
                            {time}
                          </ThemedText>
                        </View>
                      </ElevatedCard>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  dayGroup: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.sm },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  dayLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  entries: { gap: 0 },
  entryRow: { flexDirection: "row", gap: 12 },
  timelineCol: { width: 16, alignItems: "center", paddingTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  line: { width: 1.5, flex: 1, marginTop: 3 },
  entryCard: { flex: 1, marginBottom: 8 },
  entryHeader: { flexDirection: "row", alignItems: "flex-start" },
  iconBadge: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  entryMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
});
