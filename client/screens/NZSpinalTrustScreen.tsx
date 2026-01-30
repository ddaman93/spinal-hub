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

// NZ Spinal Trust Brand Colors
const NZST_COLORS = {
  primary: "#00A3E0", // Bright blue from their branding
  secondary: "#005A87", // Darker blue
  accent: "#7ED321", // Green accent
  lightBg: "#E6F7FF", // Light blue for light mode
  darkBg: "#003D5C", // Dark blue for dark mode
};

type QuickActionButton = {
  label: string;
  url: string;
  icon: keyof typeof Feather.glyphMap;
};

const QUICK_ACTIONS: QuickActionButton[] = [
  {
    label: "Peer & Whānau Support",
    url: "https://nzspinaltrust.org.nz/new-to-sci/peer-and-whanau-support/",
    icon: "users",
  },
  {
    label: "Ask Dr B",
    url: "https://nzspinaltrust.org.nz/i-need-information/ask-dr-b/",
    icon: "help-circle",
  },
  {
    label: "Contact",
    url: "https://nzspinaltrust.org.nz/contact-us/",
    icon: "mail",
  },
];

const HELP_WITH = [
  "Peer support and connection with others living with SCI",
  "Whānau and family support services",
  "Information and resources about living with SCI",
  "Connecting with healthcare professionals",
  "Advocacy and navigation of services",
  "Community events and programs",
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

export default function NZSpinalTrustScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, colorScheme } = useTheme();

  const brandPrimary = NZST_COLORS.primary;
  const brandAccent =
    colorScheme === "dark" ? NZST_COLORS.darkBg : NZST_COLORS.lightBg;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
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
              New Zealand Spinal Trust
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Supporting people with spinal cord injuries and their whānau
              through peer connection, information, and advocacy.
            </ThemedText>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <ThemedText
            type="h4"
            style={[styles.sectionTitle, { color: theme.text }]}
          >
            Quick Actions
          </ThemedText>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <Pressable
                key={index}
                onPress={() => openURL(action.url)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: brandPrimary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Open ${action.label}`}
              >
                <Feather name={action.icon} size={28} color="#FFFFFF" />
                <ThemedText
                  type="body"
                  style={[styles.actionText, { color: "#FFFFFF" }]}
                >
                  {action.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* WHAT THEY CAN HELP WITH */}
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
                What they can help with
              </ThemedText>
            </View>
            <View style={styles.bulletList}>
              {HELP_WITH.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: brandPrimary },
                    ]}
                  />
                  <ThemedText
                    type="body"
                    style={[
                      styles.bulletText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* CONTACT CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={24} color={brandPrimary} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Locations
              </ThemedText>
            </View>

            <View style={styles.locationContainer}>
              <ThemedText
                type="body"
                style={[styles.locationName, { color: theme.text }]}
              >
                Auckland Office
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.locationDetails, { color: theme.textSecondary }]}
              >
                Supporting the upper North Island
              </ThemedText>
              <Pressable
                onPress={() => Linking.openURL("tel:0800 10 10 20")}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Call Auckland office"
              >
                <ThemedText
                  type="body"
                  style={[styles.contactLink, { color: brandPrimary }]}
                >
                  📞 0800 10 10 20
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() =>
                  Linking.openURL("mailto:auckland@nzspinaltrust.org.nz")
                }
                accessible
                accessibilityRole="button"
                accessibilityLabel="Email Auckland office"
              >
                <ThemedText
                  type="body"
                  style={[styles.contactLink, { color: brandPrimary }]}
                >
                  ✉️ auckland@nzspinaltrust.org.nz
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.locationContainer}>
              <ThemedText
                type="body"
                style={[styles.locationName, { color: theme.text }]}
              >
                Christchurch Office
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.locationDetails, { color: theme.textSecondary }]}
              >
                Supporting the South Island
              </ThemedText>
              <Pressable
                onPress={() => Linking.openURL("tel:0800 10 10 20")}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Call Christchurch office"
              >
                <ThemedText
                  type="body"
                  style={[styles.contactLink, { color: brandPrimary }]}
                >
                  📞 0800 10 10 20
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() =>
                  Linking.openURL("mailto:christchurch@nzspinaltrust.org.nz")
                }
                accessible
                accessibilityRole="button"
                accessibilityLabel="Email Christchurch office"
              >
                <ThemedText
                  type="body"
                  style={[styles.contactLink, { color: brandPrimary }]}
                >
                  ✉️ christchurch@nzspinaltrust.org.nz
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* BOTTOM CTA */}
        <Pressable
          onPress={() => openURL("https://nzspinaltrust.org.nz/")}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: NZST_COLORS.secondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Visit NZ Spinal Trust website"
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
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 72,
  },
  actionText: {
    flex: 1,
    fontWeight: "600",
    fontSize: 16,
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
  locationContainer: {
    marginBottom: Spacing.lg,
  },
  locationName: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  locationDetails: {
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  contactLink: {
    marginTop: Spacing.xs,
    textDecorationLine: "underline",
  },
  contactNote: {
    marginTop: Spacing.xs,
    fontStyle: "italic",
    opacity: 0.8,
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
