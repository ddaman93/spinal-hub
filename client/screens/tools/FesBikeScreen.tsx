import React, { useState, useCallback } from "react";
import {
  View, ScrollView, StyleSheet, Pressable, TextInput,
  ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - Spacing.lg * 2 - 16;

type FesSession = {
  id: string;
  therapyType: string;
  sessionDate: string;
  distanceMiles: number | null;
  avgPowerWatts: number | null;
  avgPowerActiveWatts: number | null;
  maxPowerActiveWatts: number | null;
  timeOffMotorSupportS: number | null;
  sessionDurationS: number | null;
  avgStimulationUc: number | null;
  avgSymmetryPct: number | null;
};

type Config = {
  lastSyncedAt: string | null;
  upperLegTherapyId: string | null;
  lowerLegTherapyId: string | null;
  armsTherapyId: string | null;
} | null;

type Tab = "upper_leg" | "lower_leg" | "arms";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  const resp = await fetch(`${getApiUrl()}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${resp.status}`);
  }
  return resp.json();
}

function secsToMinutes(s: number): number {
  return Math.round(s / 60);
}

function formatLastSync(iso: string | null): string {
  if (!iso) return "Never synced";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export default function FesBikeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [sessions, setSessions] = useState<FesSession[]>([]);
  const [tab, setTab] = useState<Tab>("upper_leg");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [connecting, setConnecting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, sess] = await Promise.all([
        apiFetch("/api/fes/config"),
        apiFetch("/api/fes/sessions"),
      ]);
      setConfig(cfg);
      setSessions(sess);
    } catch (e) {
      console.error("FES load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleConnect = async () => {
    if (!username.trim() || !pin.trim()) {
      Alert.alert("Missing fields", "Enter your RTILink username and PIN.");
      return;
    }
    setConnecting(true);
    try {
      await apiFetch("/api/fes/connect", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), pin: pin.trim() }),
      });
      await apiFetch("/api/fes/sync", { method: "POST" });
      await loadData();
    } catch (e: any) {
      Alert.alert("Connection failed", e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await apiFetch("/api/fes/sync", { method: "POST" });
      await loadData();
      Alert.alert(
        "Sync complete",
        `${result.sessionsImported} new session${result.sessionsImported === 1 ? "" : "s"} imported.`,
      );
    } catch (e: any) {
      Alert.alert("Sync failed", e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect RTILink",
      "This removes your RTILink credentials. Your session history stays in Spinal Hub.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await apiFetch("/api/fes/disconnect", { method: "DELETE" });
            setConfig(null);
          },
        },
      ],
    );
  };

  const filteredSessions = sessions
    .filter(s => s.therapyType === tab)
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

  const distanceData = filteredSessions.slice(-30).map(s => ({ value: s.distanceMiles ?? 0 }));
  const powerData = filteredSessions.slice(-30).map(s => ({ value: s.avgPowerActiveWatts ?? s.avgPowerWatts ?? 0 }));
  const motorOffData = filteredSessions.slice(-30).map(s => ({
    value: s.timeOffMotorSupportS ? secsToMinutes(s.timeOffMotorSupportS) : 0,
  }));

  const now = Date.now();
  const fourWeeks = 28 * 24 * 3600 * 1000;
  const recent = filteredSessions.filter(s => now - new Date(s.sessionDate).getTime() < fourWeeks);
  const prior = filteredSessions.filter(s => {
    const age = now - new Date(s.sessionDate).getTime();
    return age >= fourWeeks && age < fourWeeks * 2;
  });
  const avgPower = (arr: FesSession[]) => {
    const vals = arr.map(s => s.avgPowerActiveWatts ?? s.avgPowerWatts ?? 0).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  const recentPower = avgPower(recent);
  const priorPower = avgPower(prior);
  const powerTrend = priorPower > 0 ? ((recentPower - priorPower) / priorPower) * 100 : null;

  const s = styles(theme);

  if (loading || config === undefined) {
    return (
      <ThemedView style={[s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  if (!config) {
    return (
      <ThemedView style={[s.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={s.connectContainer}>
          <ThemedText style={s.title}>FES Bike</ThemedText>
          <ThemedText style={s.subtitle}>Connect your RTILink account to import your RT300 session history.</ThemedText>

          <View style={s.field}>
            <ThemedText style={s.label}>RTILink Username / Patient ID</ThemedText>
            <TextInput
              style={[s.input, { color: theme.text, borderColor: theme.border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="e.g. 3179130"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={s.field}>
            <ThemedText style={s.label}>PIN Number</ThemedText>
            <TextInput
              style={[s.input, { color: theme.text, borderColor: theme.border }]}
              value={pin}
              onChangeText={setPin}
              placeholder="PIN"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              keyboardType="number-pad"
            />
          </View>

          <Button onPress={() => { handleConnect(); }}>
            {connecting ? "Connecting…" : "Connect & Import History"}
          </Button>
        </ScrollView>
      </ThemedView>
    );
  }

  const tabOptions = (
    [
      { key: "upper_leg" as Tab, label: "Upper Leg", hasId: !!config.upperLegTherapyId },
      { key: "lower_leg" as Tab, label: "Lower Leg", hasId: !!config.lowerLegTherapyId },
      { key: "arms" as Tab, label: "Arms", hasId: !!config.armsTherapyId },
    ] as { key: Tab; label: string; hasId: boolean }[]
  ).filter(t => t.hasId);

  return (
    <ThemedView style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* Header */}
        <View style={s.header}>
          <ThemedText style={s.title}>FES Bike</ThemedText>
          <View style={s.syncRow}>
            <ThemedText style={s.syncText}>Last sync: {formatLastSync(config.lastSyncedAt)}</ThemedText>
            <Pressable onPress={handleSync} disabled={syncing} style={s.syncBtn}>
              <ThemedText style={[s.syncBtnText, { color: theme.primary }]}>
                {syncing ? "Syncing…" : "Sync Now"}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Trend card */}
        {powerTrend !== null && (
          <View style={[
            s.trendCard,
            { backgroundColor: powerTrend >= 0 ? "#e6f4ea" : "#fdecea" },
          ]}>
            <ThemedText style={s.trendLabel}>4-week power trend</ThemedText>
            <ThemedText style={[s.trendValue, { color: powerTrend >= 0 ? "#2e7d32" : "#c62828" }]}>
              {powerTrend >= 0 ? "+" : ""}{powerTrend.toFixed(1)}%
            </ThemedText>
            <ThemedText style={s.trendSub}>
              {recentPower.toFixed(2)}W now vs {priorPower.toFixed(2)}W prior 4 weeks
            </ThemedText>
          </View>
        )}

        {/* Tabs */}
        {tabOptions.length > 1 && (
          <View style={s.tabs}>
            {tabOptions.map(t => (
              <Pressable
                key={t.key}
                style={[
                  s.tabBtn,
                  tab === t.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
                ]}
                onPress={() => setTab(t.key)}
              >
                <ThemedText style={[s.tabLabel, tab === t.key && { color: theme.primary }]}>
                  {t.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {filteredSessions.length === 0 ? (
          <ThemedText style={s.empty}>No sessions for this therapy type.</ThemedText>
        ) : (
          <>
            {/* Stats row */}
            <View style={s.statsRow}>
              <View style={[s.stat, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={s.statValue}>{filteredSessions.length}</ThemedText>
                <ThemedText style={s.statLabel}>Sessions</ThemedText>
              </View>
              <View style={[s.stat, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={s.statValue}>
                  {filteredSessions.reduce((a, s) => a + (s.distanceMiles ?? 0), 0).toFixed(0)}
                </ThemedText>
                <ThemedText style={s.statLabel}>Total miles</ThemedText>
              </View>
              <View style={[s.stat, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={s.statValue}>{recentPower.toFixed(1)}W</ThemedText>
                <ThemedText style={s.statLabel}>Avg power (4wk)</ThemedText>
              </View>
            </View>

            {/* Distance chart */}
            <ThemedText style={s.chartTitle}>Distance per session (last 30) — miles</ThemedText>
            <LineChart
              data={distanceData}
              width={CHART_W}
              height={160}
              color={theme.primary}
              thickness={2}
              hideDataPoints={distanceData.length > 20}
              yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              noOfSections={4}
              areaChart
              startFillColor={theme.primary}
              startOpacity={0.15}
              endOpacity={0}
            />

            {/* Power chart */}
            <ThemedText style={s.chartTitle}>Active forward power (last 30) — watts</ThemedText>
            <LineChart
              data={powerData}
              width={CHART_W}
              height={160}
              color="#6366f1"
              thickness={2}
              hideDataPoints={powerData.length > 20}
              yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              noOfSections={4}
              areaChart
              startFillColor="#6366f1"
              startOpacity={0.15}
              endOpacity={0}
            />

            {/* Time off motor support chart */}
            <ThemedText style={s.chartTitle}>Time off motor support (last 30) — minutes</ThemedText>
            <LineChart
              data={motorOffData}
              width={CHART_W}
              height={160}
              color="#10b981"
              thickness={2}
              hideDataPoints={motorOffData.length > 20}
              yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              noOfSections={4}
              areaChart
              startFillColor="#10b981"
              startOpacity={0.15}
              endOpacity={0}
            />
          </>
        )}

        {/* Disconnect */}
        <Pressable onPress={handleDisconnect} style={s.disconnectBtn}>
          <ThemedText style={[s.disconnectText, { color: theme.textSecondary }]}>
            Disconnect RTILink
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    connectContainer: { padding: Spacing.lg, gap: 16 },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    syncText: { fontSize: 12, color: theme.textSecondary },
    syncBtn: { paddingVertical: 4, paddingHorizontal: 8 },
    syncBtnText: { fontSize: 13, fontWeight: "600" },
    trendCard: {
      marginHorizontal: Spacing.lg,
      borderRadius: BorderRadius.medium,
      padding: 14,
      marginBottom: 12,
    },
    trendLabel: { fontSize: 12, fontWeight: "600", color: "#555" },
    trendValue: { fontSize: 28, fontWeight: "800", marginTop: 2 },
    trendSub: { fontSize: 12, color: "#666", marginTop: 2 },
    tabs: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: theme.border,
      marginHorizontal: Spacing.lg,
      marginBottom: 12,
    },
    tabBtn: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
    tabLabel: { fontSize: 14, fontWeight: "600", color: theme.textSecondary },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: Spacing.lg,
      marginBottom: 16,
      gap: 8,
    },
    stat: {
      flex: 1,
      borderRadius: BorderRadius.medium,
      padding: 12,
      alignItems: "center",
    },
    statValue: { fontSize: 20, fontWeight: "700" },
    statLabel: { fontSize: 11, color: theme.textSecondary, marginTop: 2, textAlign: "center" },
    chartTitle: {
      marginHorizontal: Spacing.lg,
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: 6,
      marginTop: 16,
    },
    empty: { marginHorizontal: Spacing.lg, color: theme.textSecondary, marginTop: 24 },
    disconnectBtn: {
      marginHorizontal: Spacing.lg,
      marginTop: 32,
      alignItems: "center",
      padding: 12,
    },
    disconnectText: { fontSize: 13 },
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: "600" },
    input: {
      borderWidth: 1,
      borderRadius: BorderRadius.small,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      backgroundColor: theme.backgroundSecondary,
    },
  });
