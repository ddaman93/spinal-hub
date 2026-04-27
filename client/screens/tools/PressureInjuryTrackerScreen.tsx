import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Svg, { Ellipse, Path, Circle, G } from "react-native-svg";

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
function BodyMap({
  injuries,
  onSitePress,
  width,
}: {
  injuries: any[];
  onSitePress: (site: Site) => void;
  width: number;
}) {
  const scale = width / 100;
  const height = 220 * scale;
  const { theme } = useTheme();

  function getSiteColor(siteId: string): string {
    const match = injuries.find((i) => i.site === siteId && i.status === "active");
    if (!match) return theme.backgroundTertiary;
    return stageColor(match.latestStage);
  }

  return (
    <View style={{ width, height, alignSelf: "center" }}>
      <Svg width={width} height={height} viewBox="0 0 100 220">
        {/* Body outline — back view */}
        <G opacity={0.25} fill={theme.text}>
          {/* Head */}
          <Ellipse cx="50" cy="10" rx="9" ry="10" />
          {/* Neck */}
          <Path d="M45,19 Q50,23 55,19 L55,25 Q50,27 45,25 Z" />
          {/* Torso */}
          <Path d="M28,25 Q22,28 20,40 L18,75 Q20,80 30,82 L30,95 Q35,100 50,100 Q65,100 70,95 L70,82 Q80,80 82,75 L80,40 Q78,28 72,25 Z" />
          {/* Left upper arm */}
          <Path d="M28,25 Q18,30 14,55 Q14,62 18,65 Q22,62 24,55 L28,35 Z" />
          {/* Right upper arm */}
          <Path d="M72,25 Q82,30 86,55 Q86,62 82,65 Q78,62 76,55 L72,35 Z" />
          {/* Left forearm */}
          <Path d="M14,55 Q10,65 12,80 Q16,82 20,78 Q20,65 18,65 Z" />
          {/* Right forearm */}
          <Path d="M86,55 Q90,65 88,80 Q84,82 80,78 Q80,65 82,65 Z" />
          {/* Left thigh */}
          <Path d="M30,95 Q26,100 26,140 Q28,148 34,148 Q40,145 40,138 L38,95 Z" />
          {/* Right thigh */}
          <Path d="M70,95 Q74,100 74,140 Q72,148 66,148 Q60,145 60,138 L62,95 Z" />
          {/* Left lower leg */}
          <Path d="M26,140 Q24,165 26,185 Q28,190 34,190 Q38,187 38,180 L34,148 Z" />
          {/* Right lower leg */}
          <Path d="M74,140 Q76,165 74,185 Q72,190 66,190 Q62,187 62,180 L66,148 Z" />
          {/* Left foot */}
          <Path d="M26,185 Q22,195 24,205 Q28,210 36,208 Q40,200 38,190 Z" />
          {/* Right foot */}
          <Path d="M74,185 Q78,195 76,205 Q72,210 64,208 Q60,200 62,190 Z" />
        </G>

        {/* Pressure point hotspots */}
        {SITES.map((site) => {
          const color = getSiteColor(site.id);
          const isActive = injuries.some((i) => i.site === site.id && i.status === "active");
          return (
            <G key={site.id}>
              {/* Invisible large hit target */}
              <Circle
                cx={site.x}
                cy={site.y}
                r={10}
                fill="transparent"
                onPress={() => onSitePress(site)}
              />
              {/* Visible dot */}
              <Circle
                cx={site.x}
                cy={site.y}
                r={isActive ? 5.5 : 4}
                fill={color}
                opacity={isActive ? 1 : 0.45}
                stroke={isActive ? "#fff" : theme.text}
                strokeWidth={isActive ? 1 : 0.5}
                strokeOpacity={isActive ? 0.9 : 0.3}
                onPress={() => onSitePress(site)}
              />
            </G>
          );
        })}
      </Svg>
    </View>
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
        {
          text: "Start Tracking",
          onPress: () => createWound(site),
        },
      ]
    );
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
        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(STAGE_LABELS).map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: stageColor(key) }]} />
              <ThemedText type="caption" style={{ fontSize: 10, opacity: 0.7 }}>{label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Body map */}
        <View style={styles.mapContainer}>
          {loading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <BodyMap injuries={injuries} onSitePress={handleSitePress} width={180} />
          )}
          <ThemedText type="caption" style={[styles.mapHint, { color: theme.textSecondary }]}>
            Tap a dot to view or start tracking a wound
          </ThemedText>
        </View>

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
  mapContainer: { alignItems: "center", paddingVertical: Spacing.sm },
  mapHint: { marginTop: Spacing.sm, fontSize: 11 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.sm },
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
