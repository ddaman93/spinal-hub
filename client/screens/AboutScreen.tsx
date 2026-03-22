import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const version = Constants.expoConfig?.version ?? "1.0.0";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* App info */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            App Info
          </ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
              <ThemedText type="body" style={styles.label}>App Name</ThemedText>
              <ThemedText type="body" style={[styles.value, { color: theme.textSecondary }]}>Spinal Hub</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="body" style={styles.label}>Version</ThemedText>
              <ThemedText type="body" style={[styles.value, { color: theme.textSecondary }]}>{version}</ThemedText>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            About
          </ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
              Spinal Hub is a companion app for people living with spinal cord injuries. It brings together health tracking tools, assistive technology information, SCI news, and community resources in one place.
            </ThemedText>
          </View>
        </View>

        {/* Medical disclaimer */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Medical Disclaimer
          </ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
              Spinal Hub is intended for informational and personal tracking purposes only. It is not a medical device and does not provide medical advice, diagnosis, or treatment.
            </ThemedText>
            <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary, marginTop: Spacing.sm }]}>
              Always consult a qualified healthcare professional before making decisions about your health, medications, or treatment plan.
            </ThemedText>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Feedback
          </ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
              We'd love to hear from you. Feedback and feature requests help make the app better for the whole SCI community.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    padding: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  label: {
    fontWeight: "600",
  },
  value: {
    opacity: 0.8,
  },
  paragraph: {
    lineHeight: 22,
    opacity: 0.8,
  },
});
