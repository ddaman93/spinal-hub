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

type Channel = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
};

const CHANNELS: Channel[] = [
  {
    id: "general",
    name: "General",
    description: "Open discussion for the SCI community",
    icon: "message-circle",
    color: "#007AFF",
  },
  {
    id: "equipment-tech",
    name: "Equipment & Tech",
    description: "Wheelchairs, assistive tech & gear",
    icon: "settings",
    color: "#5C6BC0",
  },
  {
    id: "care-companies",
    name: "Care Companies",
    description: "Share experiences with carer providers",
    icon: "users",
    color: "#34C759",
  },
  {
    id: "transport",
    name: "Taxi & Transport",
    description: "Accessible transport tips & reviews",
    icon: "navigation",
    color: "#1C7ED6",
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    description: "Tips, routines and health experiences",
    icon: "heart",
    color: "#FF6B6B",
  },
  {
    id: "research-trials",
    name: "Research & Trials",
    description: "SCI research news and clinical trials",
    icon: "activity",
    color: "#AF52DE",
  },
  {
    id: "spinal-units",
    name: "Spinal Units",
    description: "Experiences and info about spinal rehabilitation units",
    icon: "crosshair",
    color: "#FF9500",
  },
  {
    id: "acc",
    name: "ACC",
    description: "ACC funding, entitlements and navigating the system",
    icon: "briefcase",
    color: "#30B0C7",
  },
];

export default function CommunityChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]}>
          A space for the SCI community to connect and share. Be respectful and supportive.
        </ThemedText>

        <View style={styles.list}>
          {CHANNELS.map((channel) => (
            <Pressable
              key={channel.id}
              onPress={() =>
                navigation.navigate("ChatRoom", {
                  channelId: channel.id,
                  channelName: channel.name,
                })
              }
              style={({ pressed }) => [
                styles.channelRow,
                { backgroundColor: theme.backgroundDefault },
                pressed && { opacity: 0.75 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${channel.name} channel`}
            >
              <View style={[styles.iconWrap, { backgroundColor: channel.color }]}>
                <Feather name={channel.icon} size={20} color="#fff" />
              </View>

              <View style={styles.channelText}>
                <ThemedText type="body" style={styles.channelName}>
                  {channel.name}
                </ThemedText>
                <ThemedText type="small" style={[styles.channelDesc, { color: theme.textSecondary }]}>
                  {channel.description}
                </ThemedText>
              </View>

              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  subtitle: {
    lineHeight: 20,
    opacity: 0.8,
  },
  list: {
    gap: Spacing.sm,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 72,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.small,
    justifyContent: "center",
    alignItems: "center",
  },
  channelText: {
    flex: 1,
    gap: 2,
  },
  channelName: {
    fontWeight: "600",
  },
  channelDesc: {
    opacity: 0.75,
  },
});
