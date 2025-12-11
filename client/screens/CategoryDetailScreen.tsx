import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type CategoryDetailRouteProp = RouteProp<MainStackParamList, "CategoryDetail">;

type Tool = {
  id: string;
  name: string;
  description: string;
};

const getToolsForCategory = (categoryId: string): Tool[] => {
  const toolsByCategory: Record<string, Tool[]> = {
    "daily-routine": [
      { id: "1", name: "Morning Checklist", description: "Track your morning routine tasks" },
      { id: "2", name: "Medication Reminder", description: "Never miss your medications" },
      { id: "3", name: "Hydration Tracker", description: "Log water intake throughout the day" },
    ],
    "health-tracking": [
      { id: "1", name: "Vital Signs Log", description: "Record blood pressure, heart rate, and more" },
      { id: "2", name: "Pain Journal", description: "Track pain levels and locations" },
      { id: "3", name: "Bowel Program", description: "Monitor bowel management routine" },
      { id: "4", name: "Skin Check", description: "Document pressure areas and skin condition" },
    ],
    "care-support": [
      { id: "1", name: "Caregiver Schedule", description: "Manage caregiver shifts and tasks" },
      { id: "2", name: "Emergency Contacts", description: "Quick access to important contacts" },
      { id: "3", name: "Care Instructions", description: "Detailed care protocols for caregivers" },
    ],
    "appointments": [
      { id: "1", name: "Doctor Visits", description: "Track upcoming medical appointments" },
      { id: "2", name: "Therapy Sessions", description: "Physical and occupational therapy schedule" },
      { id: "3", name: "Equipment Maintenance", description: "Wheelchair and equipment service dates" },
    ],
    "life-management": [
      { id: "1", name: "Financial Tracker", description: "Manage healthcare expenses and insurance" },
      { id: "2", name: "Goals & Milestones", description: "Set and track personal goals" },
      { id: "3", name: "Notes & Journal", description: "Personal thoughts and reflections" },
    ],
    "custom-tools": [
      { id: "1", name: "Create New Tool", description: "Build a custom tracking tool" },
      { id: "2", name: "Import Template", description: "Use community-shared templates" },
    ],
  };

  return toolsByCategory[categoryId] || [];
};

export default function CategoryDetailScreen() {
  const route = useRoute<CategoryDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { category } = route.params;

  const tools = getToolsForCategory(category);

  const renderTool = ({ item }: { item: Tool }) => (
    <View
      style={[
        styles.toolCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.name}. ${item.description}`}
    >
      <ThemedText type="h4" style={styles.toolName}>
        {item.name}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.toolDescription, { color: theme.textSecondary }]}
      >
        {item.description}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tools}
        renderItem={renderTool}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body">No tools available yet.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  toolCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 80,
  },
  toolName: {
    marginBottom: Spacing.xs,
  },
  toolDescription: {
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing.xxl,
  },
});
