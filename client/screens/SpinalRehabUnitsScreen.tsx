import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const BRAND_COLOR = "#1A6B9E";

const REHAB_UNITS = [
  {
    id: "asru",
    name: "Auckland Spinal Rehabilitation Unit (ASRU)",
    hospital: "Middlemore Hospital",
    region: "Auckland",
    phone: "09 276 0000",
    website: "https://www.countiesmanukau.health.nz",
    description:
      "The main spinal rehabilitation unit for the upper North Island, specialising in acute and rehabilitation care for traumatic and non-traumatic SCI.",
  },
  {
    id: "burwood",
    name: "Burwood Spinal Unit",
    hospital: "Burwood Hospital",
    region: "Christchurch",
    phone: "03 383 6833",
    website: "https://www.burwood.org.nz",
    description:
      "New Zealand's largest spinal rehabilitation centre, providing acute, rehabilitation, and outpatient services for SCI patients in the South Island and lower North Island.",
  },
  {
    id: "wellington",
    name: "Wellington Hospital Spinal Service",
    hospital: "Wellington Regional Hospital",
    region: "Wellington",
    phone: "04 385 5999",
    website: "https://www.ccdhb.org.nz",
    description:
      "Provides acute spinal injury management and rehabilitation services for the lower North Island region.",
  },
];

async function openURL(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open this link");
    }
  } catch (error) {
    console.error("Error opening URL:", error);
    Alert.alert("Error", "Something went wrong opening this link");
  }
}

export default function SpinalRehabUnitsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

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
        {/* HEADER CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
            styles.headerCard,
          ]}
        >
          <View
            style={[styles.headerAccent, { backgroundColor: BRAND_COLOR }]}
          />
          <View style={styles.cardContent}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              NZ Spinal Rehabilitation Units
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Acute care &amp; rehabilitation centres
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.bodyText, { color: theme.textSecondary }]}
            >
              New Zealand has three dedicated spinal rehabilitation units
              serving different regions. Each provides acute management,
              inpatient rehabilitation, and ongoing outpatient services for
              people living with spinal cord injury.
            </ThemedText>
          </View>
        </View>

        {/* UNIT CARDS */}
        {REHAB_UNITS.map((unit) => (
          <View
            key={unit.id}
            style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.cardContent}>
              {/* Unit name + region pill */}
              <View style={styles.unitHeader}>
                <View style={styles.unitTitleRow}>
                  <ThemedText
                    type="h4"
                    style={[styles.unitName, { color: theme.text }]}
                  >
                    {unit.name}
                  </ThemedText>
                </View>
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.regionPill,
                      { backgroundColor: BRAND_COLOR + "22" },
                    ]}
                  >
                    <Feather name="map-pin" size={12} color={BRAND_COLOR} />
                    <ThemedText
                      type="caption"
                      style={[styles.regionText, { color: BRAND_COLOR }]}
                    >
                      {unit.region}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    {unit.hospital}
                  </ThemedText>
                </View>
              </View>

              {/* Description */}
              <ThemedText
                type="body"
                style={[styles.bodyText, { color: theme.textSecondary }]}
              >
                {unit.description}
              </ThemedText>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <Pressable
                  onPress={() => openURL(`tel:${unit.phone.replace(/\s/g, "")}`)}
                  style={({ pressed }) => [
                    styles.callButton,
                    { backgroundColor: "#1A8A3C", opacity: pressed ? 0.8 : 1 },
                  ]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${unit.name}`}
                >
                  <Feather name="phone" size={16} color="#FFFFFF" />
                  <ThemedText
                    type="body"
                    style={[styles.buttonText, { color: "#FFFFFF" }]}
                  >
                    Call {unit.phone}
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => openURL(unit.website)}
                  style={({ pressed }) => [
                    styles.websiteButton,
                    {
                      borderColor: BRAND_COLOR,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Visit ${unit.name} website`}
                >
                  <Feather name="external-link" size={16} color={BRAND_COLOR} />
                  <ThemedText
                    type="body"
                    style={[styles.buttonText, { color: BRAND_COLOR }]}
                  >
                    Website
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  headerCard: {
    position: "relative",
  },
  headerAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  headerSubtitle: {
    marginTop: Spacing.xs,
    lineHeight: 24,
  },
  bodyText: {
    lineHeight: 22,
  },
  unitHeader: {
    gap: Spacing.xs,
  },
  unitTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  unitName: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  regionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  regionText: {
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 48,
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1.5,
    minHeight: 48,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
