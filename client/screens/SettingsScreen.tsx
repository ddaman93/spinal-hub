import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type SettingItem = {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  description?: string;
};

const settingsItems: SettingItem[] = [
  { id: "display", title: "Display", icon: "monitor", description: "Theme and appearance" },
  { id: "voice", title: "Voice Settings", icon: "mic", description: "Voice control preferences" },
  { id: "accessibility", title: "Accessibility", icon: "eye", description: "Accessibility options" },
  { id: "notifications", title: "Notifications", icon: "bell", description: "Manage alerts and reminders" },
  { id: "data", title: "Data & Backup", icon: "database", description: "Export and backup your data" },
  { id: "about", title: "About", icon: "info", description: "App version and info" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const handleSettingPress = (id: string) => {
    if (id === "display") {
      navigation.navigate("DisplaySettings");
    }
  };

  const renderSettingItem = (item: SettingItem) => (
    <Pressable
      key={item.id}
      onPress={() => handleSettingPress(item.id)}
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && { opacity: 0.7 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.description}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <Feather name={item.icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="h4" style={styles.settingTitle}>
          {item.title}
        </ThemedText>
        {item.description ? (
          <ThemedText
            type="small"
            style={[styles.settingDescription, { color: theme.textSecondary }]}
          >
            {item.description}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={24} color={theme.textSecondary} />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <View style={styles.section}>
          {settingsItems.map(renderSettingItem)}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 72,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.small,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
  },
  settingDescription: {
    opacity: 0.7,
  },
});
