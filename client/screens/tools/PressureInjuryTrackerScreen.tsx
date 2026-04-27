import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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

type Nav = NativeStackNavigationProp<MainStackParamList>;

// ---------------------------------------------------------------------------
// Anatomical sites
// ---------------------------------------------------------------------------
export type Site = {
  id: string;
  label: string;
  shortLabel: string;
  // position on the SVG body diagram (0–1 relative to viewBox 100×220)
  x: number;
  y: number;
  view: "back" | "front";
};

export const SITES: Site[] = [
  { id: "occiput",          label: "Occiput",              shortLabel: "Head",     x: 50,  y: 10,  view: "back" },
  { id: "left_scapula",     label: "Left Scapula",         shortLabel: "L Shoulder",x: 35, y: 32,  view: "back" },
  { id: "right_scapula",    label: "Right Scapula",        shortLabel: "R Shoulder",x: 65, y: 32,  view: "back" },
  { id: "left_elbow",       label: "Left Elbow",           shortLabel: "L Elbow",  x: 22,  y: 58,  view: "back" },
  { id: "right_elbow",      label: "Right Elbow",          shortLabel: "R Elbow",  x: 78,  y: 58,  view: "back" },
  { id: "sacrum",           label: "Sacrum / Coccyx",      shortLabel: "Sacrum",   x: 50,  y: 78,  view: "back" },
  { id: "left_ischium",     label: "Left Ischium",         shortLabel: "L Ischium",x: 38,  y: 88,  view: "back" },
  { id: "right_ischium",    label: "Right Ischium",        shortLabel: "R Ischium",x: 62,  y: 88,  view: "back" },
  { id: "left_trochanter",  label: "Left Trochanter",      shortLabel: "L Hip",    x: 28,  y: 85,  view: "back" },
  { id: "right_trochanter", label: "Right Trochanter",     shortLabel: "R Hip",    x: 72,  y: 85,  view: "back" },
  { id: "left_heel",        label: "Left Heel",            shortLabel: "L Heel",   x: 38,  y: 202, view: "back" },
  { id: "right_heel",       label: "Right Heel",           shortLabel: "R Heel",   x: 62,  y: 202, view: "back" },
  { id: "left_malleolus",   label: "Left Lateral Malleolus", shortLabel: "L Ankle",x: 34,  y: 193, view: "back" },
  { id: "right_malleolus",  label: "Right Lateral Malleolus",shortLabel: "R Ankle",x: 66,  y: 193, view: "back" },
];

// ---------------------------------------------------------------------------
// Stage colours
// ---------------------------------------------------------------------------
const STAGE_COLORS: Record<string, string> = {
  clear:        "#00E676",
  stage1:       "#FFD166",
  stage2:       "#FF9A3C",
  stage3:       "#FF6B6B",
  stage4:       "#C0392B",
  unstageable:  "#9B59B6",
  dti:          "#6C3483",
};

export function stageColor(stage: string | null): string {
  return STAGE_COLORS[stage ?? "clear"] ?? "#888";
}

export const STAGE_LABELS: Record<string, string> = {
  clear:        "Clear",
  stage1:       "Stage 1",
  stage2:       "Stage 2",
  stage3:       "Stage 3",
  stage4:       "Stage 4",
  unstageable:  "Unstageable",
  dti:          "Deep Tissue",
};

// ---------------------------------------------------------------------------
// Body silhouette SVG (back view, simplified anatomical)
// ---------------------------------------------------------------------------
// Grouped site layout for the button grid
const SITE_GROUPS = [
  {
    label: "Head & Upper Back",
    sites: ["occiput", "left_scapula", "right_scapula"],
  },
  {
    label: "Arms",
    sites: ["left_elbow", "right_elbow"],
  },
  {
    label: "Pelvis & Hips",
    sites: ["sacrum", "left_ischium", "right_ischium", "left_trochanter", "right_trochanter"],
  },
  {
    label: "Ankles & Heels",
    sites: ["left_malleolus", "right_malleolus", "left_heel", "right_heel"],
  },
];

function SiteButton({
  site,
  injury,
  onPress,
}: {
  site: Site;
  injury: any | null;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const color = injury ? stageColor(injury.latestStage) : theme.backgroundTertiary;
  const isActive = !!injury;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      style={[
        styles.siteBtn,
        {
          backgroundColor: isActive ? color + "22" : theme.backgroundSecondary,
          borderColor: isActive ? color : theme.backgroundTertiary,
        },
      ]}
    >
      <View style={[styles.siteDot, { backgroundColor: color, opacity: isActive ? 1 : 0.4 }]} />
      <ThemedText type="caption" style={{ flex: 1, fontSize: 12, fontWeight: isActive ? "600" : "400" }}>
        {site.shortLabel}
      </ThemedText>
      {isActive && (
        <ThemedText type="caption" style={{ color, fontWeight: "700", fontSize: 11 }}>
          {STAGE_LABELS[injury.latestStage] ?? ""}
        </ThemedText>
      )}
      <Feather name="chevron-right" size={13} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Wound card
// ---------------------------------------------------------------------------
function WoundCard({ injury, onPress }: { injury: any; onPress: () => void }) {
  const { theme } = useTheme();
  const site = SITES.find((s) => s.id === injury.site);
  const color = stageColor(injury.latestStage);
  const stageLabel = STAGE_LABELS[injury.latestStage] ?? "No assessment";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <ThemedText type="small" style={{ fontWeight: "600" }}>
          {site?.label ?? injury.siteLabel ?? injury.site}
        </ThemedText>
        <ThemedText type="caption" style={{ opacity: 0.6, marginTop: 2 }}>
          {stageLabel}
          {injury.lastChecked ? `  ·  ${new Date(injury.lastChecked).toLocaleDateString()}` : ""}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={16} color={theme.textSecondary} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function PressureInjuryTrackerScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [injuries, setInjuries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/pressure-injuries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInjuries(data);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const active = injuries.filter((i) => i.status === "active");
  const healed = injuries.filter((i) => i.status === "healed");

  function handleSitePress(site: Site) {
    try {
      const existing = injuries.find((i) => i.site === site.id && i.status === "active");
      if (existing) {
        navigation.navigate("PressureInjuryDetail", {
          injuryId: existing.id,
          site: existing.site,
          siteLabel: existing.siteLabel,
        });
        return;
      }
      Alert.alert(
        site.label,
        "Start tracking a wound at this site?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Start Tracking", onPress: () => createWound(site) },
        ]
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  }

  async function createWound(site: Site) {
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/pressure-injuries`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ site: site.id }),
      });
      if (!res.ok) throw new Error();
      const injury = await res.json();
      await load();
      navigation.navigate("AddPressureCheck", { injuryId: injury.id, site: site.id });
    } catch {
      Alert.alert("Error", "Could not create wound record. Please try again.");
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.sm, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* Stage legend */}
        <View style={styles.legend}>
          {Object.entries(STAGE_LABELS).map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: stageColor(key) }]} />
              <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>{label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Site buttons grouped by body region */}
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: Spacing.xl }}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          SITE_GROUPS.map((group) => (
            <View key={group.label} style={styles.section}>
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                {group.label.toUpperCase()}
              </ThemedText>
              {group.sites.map((siteId) => {
                const site = SITES.find((s) => s.id === siteId)!;
                const injury = injuries.find((i) => i.site === siteId && i.status === "active");
                return (
                  <SiteButton key={siteId} site={site} injury={injury ?? null} onPress={() => handleSitePress(site)} />
                );
              })}
            </View>
          ))
        )}

        {/* Active wounds */}
        {active.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ACTIVE WOUNDS ({active.length})
            </ThemedText>
            {active.map((injury) => (
              <WoundCard
                key={injury.id}
                injury={injury}
                onPress={() => navigation.navigate("PressureInjuryDetail", {
                  injuryId: injury.id,
                  site: injury.site,
                  siteLabel: injury.siteLabel,
                })}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!loading && active.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="shield" size={40} color={theme.primary} style={{ opacity: 0.4 }} />
            <ThemedText type="small" style={{ opacity: 0.5, marginTop: Spacing.sm, textAlign: "center" }}>
              No active wounds.{"\n"}Tap a site on the body map to start tracking.
            </ThemedText>
          </View>
        )}

        {/* Healed wounds */}
        {healed.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              HEALED ({healed.length})
            </ThemedText>
            {healed.map((injury) => (
              <WoundCard
                key={injury.id}
                injury={injury}
                onPress={() => navigation.navigate("PressureInjuryDetail", {
                  injuryId: injury.id,
                  site: injury.site,
                  siteLabel: injury.siteLabel,
                })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB — Care Network */}
      <Pressable
        onPress={() => navigation.navigate("CareNetwork")}
        style={[styles.fab, { backgroundColor: theme.primary, bottom: insets.bottom + Spacing.lg }]}
      >
        <Feather name="users" size={20} color="#fff" />
        <ThemedText type="small" style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
          Care Network
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
    justifyContent: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.sm },
  siteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
  },
  siteDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  cardAccent: { width: 4, alignSelf: "stretch" },
  cardBody: { flex: 1, padding: Spacing.md },
  emptyState: { alignItems: "center", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xl },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
