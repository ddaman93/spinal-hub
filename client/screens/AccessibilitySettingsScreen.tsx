import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserPreferences } from "@/lib/storage";

export default function AccessibilitySettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    storage.preferences.get().then(setPrefs);
  }, []);

  const updatePref = async (key: keyof UserPreferences, value: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await storage.preferences.save(updated);
  };

  if (!prefs) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Display &amp; Motion
          </ThemedText>

          <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={styles.settingLabel}>
                Large Text
              </ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Preference saved — full scaling coming in a future update
              </ThemedText>
            </View>
            <ToggleSwitch
              value={prefs.largeText ?? false}
              onToggle={(v) => updatePref("largeText", v)}
              accessibilityLabel="Toggle large text"
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={styles.settingLabel}>
                Reduce Motion
              </ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Minimise animations throughout the app
              </ThemedText>
            </View>
            <ToggleSwitch
              value={prefs.reduceMotion ?? false}
              onToggle={(v) => updatePref("reduceMotion", v)}
              accessibilityLabel="Toggle reduce motion"
            />
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
