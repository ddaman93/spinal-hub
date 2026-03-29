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

// CCS Disability Action Brand Colors
const CCS_COLORS = {
  primary: "#00875A", // Green
  secondary: "#006644", // Darker green
  lightBg: "#E3FCEF", // Light green for light mode
  darkBg: "#003D26", // Dark green for dark mode
};

const WHAT_IT_DOES = [
  "Helps navigate Individualised Funding (IF) and disability support options",
  "Provides support workers (where available/contracted)",
  "Disability advocacy for access and service issues",
  "Information/support for mobility parking and community transport schemes",
  "Helps with community participation and inclusion",
];

const WHY_IT_HELPS = [
  "Support worker coordination and backup planning",
  "Funding navigation (NASC/IF/other local pathways)",
  "Advocacy for access barriers and service disputes",
  "Practical support for community reintegration",
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

export default function CcsDisabilityActionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const brandPrimary = CCS_COLORS.primary;

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
            style={[styles.headerAccent, { backgroundColor: brandPrimary }]}
          />
          <View style={styles.cardContent}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              CCS Disability Action
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Support services, funding &amp; advocacy
            </ThemedText>
          </View>
        </View>

        {/* WHAT IT IS */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Feather name="info" size={24} color={brandPrimary} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                What it is
              </ThemedText>
            </View>
            <ThemedText
              type="body"
              style={[styles.bodyText, { color: theme.textSecondary }]}
            >
              CCS Disability Action is a nationwide disability support
              organisation that provides advocacy, support services, and funding
              guidance for people living with disabilities in New Zealand.
            </ThemedText>
          </View>
        </View>

        {/* WHAT IT DOES */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Feather name="check-circle" size={24} color={brandPrimary} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                What it does
              </ThemedText>
            </View>
            <View style={styles.bulletList}>
              {WHAT_IT_DOES.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: brandPrimary },
                    ]}
                  />
                  <ThemedText
                    type="body"
                    style={[styles.bulletText, { color: theme.textSecondary }]}
                  >
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* WHO IT'S FOR */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={24} color={brandPrimary} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Who it&apos;s for
              </ThemedText>
            </View>
            <ThemedText
              type="body"
              style={[styles.bodyText, { color: theme.textSecondary }]}
            >
              People in New Zealand living with disabilities, including spinal
              cord injury, who want help navigating support services, funding, or
              advocacy issues.
            </ThemedText>
          </View>
        </View>

        {/* WHY IT MAY HELP SPINAL PATIENTS */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={24} color={brandPrimary} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Why it may help spinal patients
              </ThemedText>
            </View>
            <View style={styles.bulletList}>
              {WHY_IT_HELPS.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: brandPrimary },
                    ]}
                  />
                  <ThemedText
                    type="body"
                    style={[styles.bulletText, { color: theme.textSecondary }]}
                  >
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* BOTTOM CTA */}
        <Pressable
          onPress={() => openURL("https://www.ccsdisabilityaction.org.nz/")}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: CCS_COLORS.secondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Visit CCS Disability Action website"
        >
          <ThemedText
            type="body"
            style={[styles.ctaText, { color: "#FFFFFF" }]}
          >
            Visit Website
          </ThemedText>
          <Feather name="external-link" size={20} color="#FFFFFF" />
        </Pressable>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bodyText: {
    lineHeight: 22,
  },
  bulletList: {
    gap: Spacing.md,
  },
  bulletItem: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 56,
    marginTop: Spacing.md,
  },
  ctaText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
