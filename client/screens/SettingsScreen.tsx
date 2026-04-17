import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert, ActivityIndicator } from "react-native";
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
import { getApiUrl } from "@/lib/query-client";
import { getToken, clearToken } from "@/lib/auth";
import { useTour } from "@/context/TourContext";
import { TourTarget } from "@/components/TourTarget";

const PRIVACY_URL = "https://imaginative-tiramisu-f84d2c.netlify.app/privacy";

type SettingItem = {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  description?: string;
};

const settingsItems: SettingItem[] = [
  { id: "display", title: "Display", icon: "monitor", description: "Theme and appearance" },
  { id: "accessibility", title: "Accessibility", icon: "eye", description: "Accessibility options" },
  { id: "notifications", title: "Notifications", icon: "bell", description: "Manage alerts and reminders" },
  { id: "health", title: "Health Defaults", icon: "heart", description: "Hydration goal & reminder intervals" },
  { id: "data", title: "Data & Backup", icon: "database", description: "Export and backup your data" },
  { id: "feedback", title: "Send Feedback", icon: "message-square", description: "Suggest features or report issues" },
  { id: "tour", title: "App Tour", icon: "play-circle", description: "Replay the feature walkthrough" },
  { id: "about", title: "About", icon: "info", description: "App version and info" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { startTour, registerScrollRef } = useTour();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    registerScrollRef("SettingsTab", scrollRef);
  }, [registerScrollRef]);

  const handleSettingPress = (id: string) => {
    if (id === "display") navigation.navigate("DisplaySettings");
    else if (id === "notifications") navigation.navigate("NotificationSettings");
    else if (id === "accessibility") navigation.navigate("AccessibilitySettings");
    else if (id === "data") navigation.navigate("DataBackup");
    else if (id === "about") navigation.navigate("About");
    else if (id === "health") navigation.navigate("HealthDefaults");
    else if (id === "feedback") navigation.navigate("Feedback");
    else if (id === "tour") startTour();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            setDeletingAccount(true);
            try {
              const token = await getToken();
              const res = await fetch(`${getApiUrl()}/api/auth/account`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error("Server error");
              await clearToken();
              Alert.alert("Account deleted", "Your account has been permanently removed.");
            } catch {
              Alert.alert("Error", "Could not delete account. Please try again or contact support.");
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
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
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <View style={styles.section}>
          <TourTarget stepId="settings-overview" scrollRef={scrollRef}>
            {renderSettingItem(settingsItems[0])}
          </TourTarget>
          {settingsItems.slice(1).map(renderSettingItem)}
        </View>

        {/* Legal */}
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          LEGAL
        </ThemedText>
        <View style={styles.section}>
          <Pressable
            onPress={() => Linking.openURL(PRIVACY_URL)}
            style={({ pressed }) => [styles.settingItem, { backgroundColor: theme.backgroundDefault }, pressed && { opacity: 0.7 }]}
            accessible
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy"
          >
            <View style={[styles.iconContainer, { backgroundColor: "#5856D6" }]}>
              <Feather name="shield" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <ThemedText type="h4" style={styles.settingTitle}>Privacy Policy</ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                How we handle your data
              </ThemedText>
            </View>
            <Feather name="external-link" size={20} color={theme.textSecondary} />
          </Pressable>

        </View>

        {/* Medical disclaimer */}
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          MEDICAL DISCLAIMER
        </ThemedText>
        <View style={[styles.disclaimerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="alert-circle" size={18} color={theme.textSecondary} style={{ marginTop: 1, flexShrink: 0 }} />
          <ThemedText type="small" style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            Spinal Hub is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult your doctor, spinal specialist, or qualified healthcare provider before making any decisions about your health or care.
          </ThemedText>
        </View>

        {/* Danger zone */}
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          ACCOUNT
        </ThemedText>
        <View style={styles.section}>
          <Pressable
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
            style={({ pressed }) => [styles.settingItem, { backgroundColor: theme.backgroundDefault }, pressed && { opacity: 0.7 }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <View style={[styles.iconContainer, { backgroundColor: "#D32F2F" }]}>
              {deletingAccount
                ? <ActivityIndicator size="small" color="#fff" />
                : <Feather name="trash-2" size={20} color="#FFFFFF" />}
            </View>
            <View style={styles.textContainer}>
              <ThemedText type="h4" style={[styles.settingTitle, { color: "#D32F2F" }]}>
                Delete Account
              </ThemedText>
              <ThemedText type="small" style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Permanently remove your account and data
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: 4,
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
  disclaimerCard: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 20,
    opacity: 0.8,
  },
});
