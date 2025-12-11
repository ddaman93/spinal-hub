import React from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

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
  icon: keyof typeof Feather.glyphMap;
  screen?: keyof MainStackParamList;
  comingSoon?: boolean;
};

const getToolsForCategory = (categoryId: string): Tool[] => {
  const toolsByCategory: Record<string, Tool[]> = {
    "daily-routine": [
      { id: "1", name: "Morning Routine", description: "Track your morning care tasks", icon: "sunrise", screen: "MorningRoutine" },
      { id: "2", name: "Evening Routine", description: "Complete your evening checklist", icon: "moon", screen: "EveningRoutine" },
      { id: "3", name: "Hydration Tracker", description: "Log water intake throughout the day", icon: "droplet", screen: "HydrationTracker" },
    ],
    "health-tracking": [
      { id: "1", name: "Vital Signs Log", description: "Record blood pressure, heart rate, and more", icon: "heart", screen: "VitalsLog" },
      { id: "2", name: "Pain Journal", description: "Track pain levels and locations", icon: "activity", screen: "PainJournal" },
      { id: "3", name: "Medications", description: "Manage and track your medications", icon: "clipboard", screen: "MedicationTracker" },
    ],
    "care-support": [
      { id: "1", name: "Emergency Contacts", description: "Quick access to important contacts", icon: "phone", screen: "EmergencyContacts" },
      { id: "2", name: "Caregiver Notes", description: "Share notes with your care team", icon: "file-text", comingSoon: true },
      { id: "3", name: "Care Instructions", description: "Detailed care protocols", icon: "book", comingSoon: true },
    ],
    "appointments": [
      { id: "1", name: "Schedule", description: "Manage upcoming appointments", icon: "calendar", screen: "AppointmentScheduler" },
      { id: "2", name: "Therapy Sessions", description: "PT and OT session tracking", icon: "activity", comingSoon: true },
      { id: "3", name: "Equipment Maintenance", description: "Service and maintenance dates", icon: "tool", comingSoon: true },
    ],
    "life-management": [
      { id: "1", name: "Notes & Journal", description: "Personal thoughts and reflections", icon: "edit-3", comingSoon: true },
      { id: "2", name: "Goals & Milestones", description: "Set and track personal goals", icon: "target", comingSoon: true },
      { id: "3", name: "Financial Tracker", description: "Healthcare expenses and insurance", icon: "dollar-sign", comingSoon: true },
    ],
    "custom-tools": [
      { id: "1", name: "Create New Tool", description: "Build a custom tracking tool", icon: "plus-circle", comingSoon: true },
      { id: "2", name: "Import Template", description: "Use community-shared templates", icon: "download", comingSoon: true },
    ],
  };

  return toolsByCategory[categoryId] || [];
};

export default function CategoryDetailScreen() {
  const route = useRoute<CategoryDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { category } = route.params;

  const tools = getToolsForCategory(category);

  const handleToolPress = (tool: Tool) => {
    if (tool.screen) {
      navigation.navigate(tool.screen);
    }
  };

  const renderTool = ({ item }: { item: Tool }) => (
    <Pressable
      onPress={() => handleToolPress(item)}
      disabled={item.comingSoon}
      style={[
        styles.toolCard,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: item.comingSoon ? 0.6 : 1,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.name}. ${item.description}${item.comingSoon ? ". Coming soon." : ""}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
        <Feather name={item.icon} size={28} color={theme.primary} />
      </View>
      <View style={styles.toolContent}>
        <View style={styles.toolHeader}>
          <ThemedText type="h4" style={styles.toolName}>
            {item.name}
          </ThemedText>
          {item.comingSoon ? (
            <View style={[styles.comingSoonBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Soon
              </ThemedText>
            </View>
          ) : (
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          )}
        </View>
        <ThemedText
          type="body"
          style={[styles.toolDescription, { color: theme.textSecondary }]}
        >
          {item.description}
        </ThemedText>
      </View>
    </Pressable>
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
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  toolCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    minHeight: 88,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  toolContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  toolHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolName: {
    flex: 1,
  },
  comingSoonBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.small,
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
