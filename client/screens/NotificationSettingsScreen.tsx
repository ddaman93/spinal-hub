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

export default function NotificationSettingsScreen() {
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
            Reminders
          </ThemedText>

          <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={styles.settingLabel}>
                Medication Reminders
              </ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Alerts for scheduled medications
              </ThemedText>
            </View>
            <ToggleSwitch
              value={prefs.medicationReminders ?? false}
              onToggle={(v) => updatePref("medicationReminders", v)}
              accessibilityLabel="Toggle medication reminders"
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={styles.settingLabel}>
                Appointment Reminders
              </ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Alerts for upcoming appointments
              </ThemedText>
            </View>
            <ToggleSwitch
              value={prefs.appointmentReminders ?? false}
              onToggle={(v) => updatePref("appointmentReminders", v)}
              accessibilityLabel="Toggle appointment reminders"
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={styles.settingLabel}>
                Pressure Relief Reminders
              </ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Recurring reminders to do a pressure relief
              </ThemedText>
            </View>
            <ToggleSwitch
              value={prefs.pressureReliefReminders ?? false}
              onToggle={(v) => updatePref("pressureReliefReminders", v)}
              accessibilityLabel="Toggle pressure relief reminders"
            />
          </View>
        </View>

        <ThemedText type="small" style={[styles.note, { color: theme.textSecondary }]}>
          Notification delivery requires system permissions to be granted. Manage in your device Settings if needed.
        </ThemedText>
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
  note: {
    opacity: 0.6,
    lineHeight: 18,
  },
});
