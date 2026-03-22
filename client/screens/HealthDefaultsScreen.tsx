import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserPreferences } from "@/lib/storage";

const HYDRATION_OPTIONS = [1500, 2000, 2500, 3000];
const PRESSURE_INTERVAL_OPTIONS = [20, 30, 45, 60];

export default function HealthDefaultsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    storage.preferences.get().then(setPrefs);
  }, []);

  const updatePref = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await storage.preferences.save(updated);
  };

  if (!prefs) return null;

  const hydrationGoal = prefs.hydrationGoalMl ?? 2000;
  const pressureInterval = prefs.pressureReliefIntervalMinutes ?? 30;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hydration Goal */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Daily Hydration Goal
          </ThemedText>
          <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
            Used as the target in the Hydration Tracker.
          </ThemedText>
          <View style={styles.optionRow}>
            {HYDRATION_OPTIONS.map((ml) => (
              <Pressable
                key={ml}
                onPress={() => updatePref("hydrationGoalMl", ml)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: hydrationGoal === ml ? theme.primary : theme.backgroundDefault,
                    borderColor: hydrationGoal === ml ? theme.primary : theme.border,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: hydrationGoal === ml }}
                accessibilityLabel={`${ml} ml`}
              >
                <ThemedText
                  type="body"
                  style={[
                    styles.optionText,
                    { color: hydrationGoal === ml ? "#fff" : theme.text },
                  ]}
                >
                  {ml} ml
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Pressure Relief Interval */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Pressure Relief Reminder Interval
          </ThemedText>
          <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
            Default reminder interval in the Pressure Relief Timer.
          </ThemedText>
          <View style={styles.optionRow}>
            {PRESSURE_INTERVAL_OPTIONS.map((min) => (
              <Pressable
                key={min}
                onPress={() => updatePref("pressureReliefIntervalMinutes", min)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: pressureInterval === min ? theme.primary : theme.backgroundDefault,
                    borderColor: pressureInterval === min ? theme.primary : theme.border,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: pressureInterval === min }}
                accessibilityLabel={`${min} minutes`}
              >
                <ThemedText
                  type="body"
                  style={[
                    styles.optionText,
                    { color: pressureInterval === min ? "#fff" : theme.text },
                  ]}
                >
                  {min} min
                </ThemedText>
              </Pressable>
            ))}
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
    marginBottom: 2,
  },
  description: {
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full ?? 24,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: "center",
  },
  optionText: {
    fontWeight: "600",
  },
});
