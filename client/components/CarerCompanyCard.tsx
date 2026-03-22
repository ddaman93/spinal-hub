import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { CareAgency } from "@/data/sciCareAgencies";

const BRAND_COLOR = "#7C3AED";
const CHECK_COLOR = "#16A34A";

type Props = {
  agency: CareAgency;
  onPress: () => void;
};

function CapabilityBadge({ label, enabled }: { label: string; enabled: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.capabilityRow}>
      <Feather
        name={enabled ? "check-circle" : "circle"}
        size={14}
        color={enabled ? CHECK_COLOR : theme.textSecondary}
      />
      <ThemedText
        type="small"
        style={{ color: enabled ? CHECK_COLOR : theme.textSecondary, fontWeight: enabled ? "600" : "400" }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export function CarerCompanyCard({ agency, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.85 : 1 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${agency.name}. Tap for details.`}
    >
      {/* Accent bar */}
      <View style={[styles.accent, { backgroundColor: BRAND_COLOR }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconBg, { backgroundColor: "rgba(124,58,237,0.12)" }]}>
            <Feather name="user-check" size={20} color={BRAND_COLOR} />
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>

        {/* Agency name */}
        <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.sm }}>
          {agency.name}
        </ThemedText>

        {/* Regions */}
        <View style={styles.regionsRow}>
          <Feather name="map-pin" size={13} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, flex: 1 }}
            numberOfLines={1}
          >
            {agency.regions.includes("All") ? "Nationwide" : agency.regions.join(" · ")}
          </ThemedText>
        </View>

        {/* Capability indicators */}
        <View style={styles.capabilities}>
          <CapabilityBadge label="SCI Experienced" enabled={agency.sciExperienced} />
          <CapabilityBadge label="Vent Support" enabled={agency.ventSupport} />
          <CapabilityBadge label="Overnight Care" enabled={agency.overnightCare} />
          <CapabilityBadge label="Bowel Routine Care" enabled={agency.bowelRoutineCare} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  accent: {
    height: 4,
    width: "100%",
  },
  content: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  regionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  capabilities: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  capabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
