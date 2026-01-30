import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function DisplaySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Section */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Appearance
          </ThemedText>

          <View
            style={[
              styles.settingRow,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingContent}>
              <ThemedText type="body" style={styles.settingLabel}>
                Dark Mode
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.settingDescription, { color: theme.textSecondary }]}
              >
                {isDark ? "Currently using dark theme" : "Currently using light theme"}
              </ThemedText>
            </View>
            <ToggleSwitch
              value={isDark}
              onToggle={toggleTheme}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        {/* Additional display settings can be added here */}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 80,
  },
  settingContent: {
    flex: 1,
    gap: Spacing.xs,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontWeight: "600",
  },
  settingDescription: {
    opacity: 0.7,
  },
});
