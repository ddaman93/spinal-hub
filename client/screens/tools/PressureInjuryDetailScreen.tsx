import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { SITES, STAGE_LABELS, stageColor } from "./PressureInjuryTrackerScreen";

type Route = RouteProp<MainStackParamList, "PressureInjuryDetail">;
type Nav = NativeStackNavigationProp<MainStackParamList>;

const WOUND_BED_LABELS: Record<string, string> = {
  granulation: "Granulation (healing)",
  slough: "Slough (yellow)",
  eschar: "Eschar (black)",
  epithelializing: "Epithelializing",
  none: "None / Intact",
};

const EXUDATE_LABELS: Record<string, string> = {
  none: "None",
  scant: "Scant",
  moderate: "Moderate",
  heavy: "Heavy",
};

const SKIN_LABELS: Record<string, string> = {
  intact: "Intact",
  erythema: "Erythema (redness)",
  macerated: "Macerated",
  induration: "Induration (hardened)",
};

function CheckCard({ check }: { check: any }) {
  const { theme } = useTheme();
  const color = stageColor(check.stage);
  const label = STAGE_LABELS[check.stage] ?? check.stage;
  const date = new Date(check.createdAt).toLocaleDateString("en-NZ", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(check.createdAt).toLocaleTimeString("en-NZ", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <View style={[styles.checkCard, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={styles.checkHeader}>
        <View style={[styles.stageChip, { backgroundColor: color + "22", borderColor: color }]}>
          <View style={[styles.stageDot, { backgroundColor: color }]} />
          <ThemedText type="caption" style={{ color, fontWeight: "700", fontSize: 12 }}>
            {label}
          </ThemedText>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <ThemedText type="caption" style={{ fontWeight: "600" }}>{date}</ThemedText>
          <ThemedText type="caption" style={{ opacity: 0.5, fontSize: 11 }}>
            {time} · {check.assessedBy?.name ?? "Unknown"}
          </ThemedText>
        </View>
      </View>

      {/* Measurements */}
      {(check.lengthCm || check.widthCm) && (
        <View style={styles.checkRow}>
          <Feather name="maximize-2" size={13} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ marginLeft: 6 }}>
            {check.lengthCm}cm × {check.widthCm}cm
            {check.depthCm ? ` × ${check.depthCm}cm deep` : ""}
          </ThemedText>
        </View>
      )}

      {/* Wound characteristics */}
      {check.woundBed && (
        <View style={styles.checkRow}>
          <Feather name="layers" size={13} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ marginLeft: 6 }}>
            {WOUND_BED_LABELS[check.woundBed] ?? check.woundBed}
          </ThemedText>
        </View>
      )}
      {check.exudate && check.exudate !== "none" && (
        <View style={styles.checkRow}>
          <Feather name="droplet" size={13} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ marginLeft: 6 }}>
            Exudate: {EXUDATE_LABELS[check.exudate] ?? check.exudate}
          </ThemedText>
        </View>
      )}
      {check.surroundingSkin && (
        <View style={styles.checkRow}>
          <Feather name="circle" size={13} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ marginLeft: 6 }}>
            Surrounding skin: {SKIN_LABELS[check.surroundingSkin] ?? check.surroundingSkin}
          </ThemedText>
        </View>
      )}
      {check.odor && (
        <View style={styles.checkRow}>
          <Feather name="alert-triangle" size={13} color="#FF9A3C" />
          <ThemedText type="caption" style={{ marginLeft: 6, color: "#FF9A3C" }}>
            Odour present
          </ThemedText>
        </View>
      )}
      {check.painScore != null && (
        <View style={styles.checkRow}>
          <Feather name="activity" size={13} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ marginLeft: 6 }}>
            Pain: {check.painScore}/10
          </ThemedText>
        </View>
      )}
      {check.notes ? (
        <ThemedText type="caption" style={[styles.notes, { color: theme.textSecondary }]}>
          {check.notes}
        </ThemedText>
      ) : null}
    </View>
  );
}

export default function PressureInjuryDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [checks, setChecks] = useState<any[]>([]);
  const [injury, setInjury] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const site = SITES.find((s) => s.id === params.site);
  const siteLabel = params.siteLabel ?? site?.label ?? params.site;

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const [injRes, checksRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/pressure-injuries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getApiUrl()}/api/pressure-injuries/${params.injuryId}/checks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const allInjuries = await injRes.json();
      const checksData = await checksRes.json();
      setInjury(allInjuries.find((i: any) => i.id === params.injuryId));
      setChecks(checksData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [params.injuryId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const latestCheck = checks[0];
  const currentStage = latestCheck?.stage ?? null;

  async function markHealed() {
    Alert.alert(
      "Mark as Healed",
      "This will close the wound record. You can still view its history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Healed",
          onPress: async () => {
            try {
              const token = await getToken();
              await fetch(`${getApiUrl()}/api/pressure-injuries/${params.injuryId}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: "healed" }),
              });
              navigation.goBack();
            } catch {
              Alert.alert("Error", "Could not update wound status.");
            }
          },
        },
      ]
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl + 80 }}
      >
        {/* Summary header */}
        <View style={[styles.summary, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4">{siteLabel}</ThemedText>
            <View style={styles.stageRow}>
              {currentStage ? (
                <>
                  <View style={[styles.stageDot, { backgroundColor: stageColor(currentStage), width: 10, height: 10 }]} />
                  <ThemedText type="small" style={{ marginLeft: 6, fontWeight: "600" }}>
                    {STAGE_LABELS[currentStage] ?? currentStage}
                  </ThemedText>
                </>
              ) : (
                <ThemedText type="small" style={{ opacity: 0.5 }}>No assessments yet</ThemedText>
              )}
            </View>
            {injury?.status === "healed" && (
              <View style={[styles.healedBadge, { backgroundColor: "#00E67622" }]}>
                <ThemedText type="caption" style={{ color: "#00E676", fontWeight: "700" }}>HEALED</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.statGroup}>
            <ThemedText type="caption" style={{ opacity: 0.5, fontSize: 11 }}>ASSESSMENTS</ThemedText>
            <ThemedText type="h3" style={{ color: theme.primary }}>{checks.length}</ThemedText>
          </View>
        </View>

        {/* Trend bar */}
        {checks.length > 1 && (
          <View style={styles.trendSection}>
            <ThemedText type="caption" style={[styles.trendLabel, { color: theme.textSecondary }]}>
              STAGE HISTORY (oldest → newest)
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendScroll}>
              <View style={styles.trendBar}>
                {[...checks].reverse().map((c, i) => (
                  <View key={c.id} style={styles.trendItem}>
                    <View style={[styles.trendDot, { backgroundColor: stageColor(c.stage) }]} />
                    {i < checks.length - 1 && (
                      <View style={[styles.trendLine, { backgroundColor: theme.backgroundTertiary }]} />
                    )}
                    <ThemedText style={{ fontSize: 9, opacity: 0.5, marginTop: 3 }}>
                      {new Date(c.createdAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Assessment history */}
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ASSESSMENT HISTORY
          </ThemedText>
          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.lg }} />
          ) : checks.length === 0 ? (
            <ThemedText type="caption" style={{ opacity: 0.5, marginTop: Spacing.sm }}>
              No assessments recorded yet.
            </ThemedText>
          ) : (
            checks.map((check) => <CheckCard key={check.id} check={check} />)
          )}
        </View>

        {/* Mark healed */}
        {injury?.status === "active" && (
          <Pressable onPress={markHealed} style={[styles.healBtn, { borderColor: "#00E676" }]}>
            <Feather name="check-circle" size={16} color="#00E676" />
            <ThemedText type="small" style={{ color: "#00E676", fontWeight: "600", marginLeft: 6 }}>
              Mark as Healed
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>

      {/* Add assessment FAB */}
      {injury?.status === "active" && (
        <Pressable
          onPress={() => navigation.navigate("AddPressureCheck", { injuryId: params.injuryId, site: params.site })}
          style={[styles.fab, { backgroundColor: theme.primary, bottom: insets.bottom + Spacing.lg }]}
        >
          <Feather name="plus" size={20} color="#fff" />
          <ThemedText type="small" style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
            Add Assessment
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    margin: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
  },
  stageRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  stageDot: { width: 8, height: 8, borderRadius: 4 },
  stageChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1,
  },
  statGroup: { alignItems: "center" },
  healedBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  trendSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  trendLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.sm },
  trendScroll: { marginTop: 4 },
  trendBar: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  trendItem: { alignItems: "center" },
  trendDot: { width: 14, height: 14, borderRadius: 7 },
  trendLine: { width: 24, height: 2 },
  section: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  checkCard: { borderRadius: BorderRadius.medium, padding: Spacing.md, gap: 6 },
  checkHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  checkRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  notes: { marginTop: 4, fontSize: 13, fontStyle: "italic" },
  healBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    margin: Spacing.lg, padding: Spacing.md,
    borderRadius: BorderRadius.medium, borderWidth: 1,
  },
  fab: {
    position: "absolute", right: Spacing.lg,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: 999,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
});
