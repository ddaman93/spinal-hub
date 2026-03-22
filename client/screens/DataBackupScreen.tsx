import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Share, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const DATA_CATEGORIES = [
  { key: "medications", label: "Medications" },
  { key: "medication_logs", label: "Medication logs" },
  { key: "appointments", label: "Appointments" },
  { key: "health_vitals", label: "Vital signs" },
  { key: "pain_entries", label: "Pain journal" },
  { key: "hydration_logs", label: "Hydration logs" },
  { key: "routine_tasks", label: "Routine tasks" },
  { key: "routine_completions", label: "Routine completions" },
  { key: "skin_check_entries", label: "Skin check log" },
  { key: "care_preferences", label: "Care preferences" },
  { key: "emergency_contacts", label: "Emergency contacts" },
  { key: "user_preferences", label: "App preferences" },
];

export default function DataBackupScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result: Record<string, any> = {};
      for (const cat of DATA_CATEGORIES) {
        const raw = await AsyncStorage.getItem(cat.key);
        result[cat.key] = raw ? JSON.parse(raw) : null;
      }
      const json = JSON.stringify(result, null, 2);
      await Share.share({
        title: "Spinal Hub Data Export",
        message: json,
      });
    } catch (error) {
      Alert.alert("Export failed", "Could not export your data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your health data, medications, appointments, and settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you sure?",
              "All data will be permanently removed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, delete all",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.clear();
                    Alert.alert("Done", "All data has been cleared.");
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* What's stored */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Stored Data
          </ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            {DATA_CATEGORIES.map((cat, i) => (
              <View
                key={cat.key}
                style={[
                  styles.categoryRow,
                  i < DATA_CATEGORIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                ]}
              >
                <Feather name="database" size={14} color={theme.textSecondary} style={styles.categoryIcon} />
                <ThemedText type="body">{cat.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Export */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Export
          </ThemedText>
          <Pressable
            onPress={handleExport}
            disabled={exporting}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Export all data as JSON"
          >
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="share" size={18} color="#fff" style={styles.buttonIcon} />
                <ThemedText type="body" style={styles.buttonText}>Export All Data</ThemedText>
              </>
            )}
          </Pressable>
          <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
            Exports a JSON file you can save or send to yourself.
          </ThemedText>
        </View>

        {/* Clear */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Danger Zone
          </ThemedText>
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: "#FF3B30" },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Clear all data"
          >
            <Feather name="trash-2" size={18} color="#fff" style={styles.buttonIcon} />
            <ThemedText type="body" style={styles.buttonText}>Clear All Data</ThemedText>
          </Pressable>
          <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
            Permanently removes all data stored on this device.
          </ThemedText>
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
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  categoryIcon: {
    marginRight: Spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 52,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  hint: {
    opacity: 0.7,
  },
});
