import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { sciCareAgencies } from "@/data/sciCareAgencies";

const BRAND_COLOR = "#7C3AED";
const CHECK_COLOR = "#16A34A";

type CapabilityRowProps = {
  label: string;
  enabled: boolean;
};

function CapabilityRow({ label, enabled }: CapabilityRowProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.capabilityRow}>
      <Feather
        name={enabled ? "check-circle" : "circle"}
        size={18}
        color={enabled ? CHECK_COLOR : theme.textSecondary}
      />
      <ThemedText
        type="body"
        style={{ color: enabled ? CHECK_COLOR : theme.textSecondary, fontWeight: enabled ? "600" : "400" }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export default function CarerCompanyDetailScreen() {
  const route =
    useRoute<RouteProp<MainStackParamList, "CarerCompanyDetail">>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const agency = sciCareAgencies.find(
    (a) => a.id === route.params.companyId,
  );

  if (!agency) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="body" style={{ padding: Spacing.lg }}>
          Provider not found.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* Header card */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.accentBar, { backgroundColor: BRAND_COLOR }]} />
          <View style={styles.cardContent}>
            <View style={[styles.iconBg, { backgroundColor: "rgba(124,58,237,0.12)" }]}>
              <Feather name="user-check" size={24} color={BRAND_COLOR} />
            </View>
            <ThemedText type="h3" style={{ color: theme.text, marginTop: Spacing.sm }}>
              {agency.name}
            </ThemedText>
          </View>
        </View>

        {/* Regions */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Feather name="map-pin" size={20} color={BRAND_COLOR} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Regions Served
              </ThemedText>
            </View>
            <View style={styles.regionsList}>
              {agency.regions.includes("All") ? (
                <View style={[styles.regionChip, { backgroundColor: "rgba(124,58,237,0.08)" }]}>
                  <ThemedText type="small" style={{ color: BRAND_COLOR, fontWeight: "500" }}>
                    Nationwide
                  </ThemedText>
                </View>
              ) : (
                agency.regions.map((r) => (
                  <View
                    key={r}
                    style={[styles.regionChip, { backgroundColor: "rgba(124,58,237,0.08)" }]}
                  >
                    <ThemedText type="small" style={{ color: BRAND_COLOR, fontWeight: "500" }}>
                      {r}
                    </ThemedText>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Capabilities */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Feather name="activity" size={20} color={BRAND_COLOR} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Capabilities
              </ThemedText>
            </View>
            <View style={styles.capabilitiesList}>
              <CapabilityRow label="SCI Experienced" enabled={agency.sciExperienced} />
              <CapabilityRow label="Vent Support" enabled={agency.ventSupport} />
              <CapabilityRow label="Overnight Care" enabled={agency.overnightCare} />
              <CapabilityRow label="Bowel Routine Care" enabled={agency.bowelRoutineCare} />
            </View>
          </View>
        </View>

        {/* Website button */}
        <Pressable
          onPress={() => Linking.openURL(agency.website)}
          style={({ pressed }) => [
            styles.ctaButton,
            styles.ctaOutline,
            {
              borderColor: BRAND_COLOR,
              backgroundColor: "transparent",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Visit ${agency.name} website`}
        >
          <Feather name="external-link" size={20} color={BRAND_COLOR} />
          <ThemedText type="body" style={[styles.ctaText, { color: BRAND_COLOR }]}>
            Visit Website
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  regionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  regionChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  capabilitiesList: {
    gap: Spacing.sm,
  },
  capabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 56,
  },
  ctaOutline: {
    borderWidth: 2,
  },
  ctaText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
