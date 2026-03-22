import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { MobilityTaxiCompany } from "@/data/mobilityTaxisNZ";

type Props = {
  company: MobilityTaxiCompany;
  onPress: () => void;
};

export function MobilityTaxiCard({ company, onPress }: Props) {
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
      accessibilityLabel={`${company.name}. Regions: ${company.regions.join(", ")}`}
    >
      {/* Accent bar */}
      <View style={[styles.accent, { backgroundColor: "#1A7F64" }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconBg, { backgroundColor: "rgba(26,127,100,0.12)" }]}>
            <Feather name="truck" size={20} color="#1A7F64" />
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>

        {/* Company name */}
        <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.sm }}>
          {company.name}
        </ThemedText>

        {/* Regions */}
        <View style={styles.regionsRow}>
          <Feather name="map-pin" size={13} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, flex: 1 }}
            numberOfLines={2}
          >
            {company.regions.join(" · ")}
          </ThemedText>
        </View>

        {/* Notes */}
        {company.notes ? (
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs, lineHeight: 18 }}
            numberOfLines={2}
          >
            {company.notes}
          </ThemedText>
        ) : null}

        {/* Wheelchair badge */}
        {company.wheelchairAccessible && (
          <View style={[styles.badge, { backgroundColor: "rgba(26,127,100,0.12)" }]}>
            <Feather name="check-circle" size={12} color="#1A7F64" />
            <ThemedText type="small" style={{ color: "#1A7F64", fontWeight: "600" }}>
              Wheelchair Accessible
            </ThemedText>
          </View>
        )}
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
    alignItems: "flex-start",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: Spacing.sm,
  },
});
