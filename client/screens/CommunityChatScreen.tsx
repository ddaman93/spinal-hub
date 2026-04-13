import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

const GUIDELINES_ACCEPTED_KEY = "community_guidelines_accepted_v1";

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
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(GUIDELINES_ACCEPTED_KEY).then((val) => {
      if (!val) setShowGuidelines(true);
    });
  }, []);

  const handleAcceptGuidelines = async () => {
    await AsyncStorage.setItem(GUIDELINES_ACCEPTED_KEY, "1");
    setShowGuidelines(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Community Guidelines / Terms modal — shown once before accessing chat */}
      <Modal visible={showGuidelines} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.modalTitle}>
              Community Guidelines
            </ThemedText>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <ThemedText type="body" style={[styles.modalBody, { color: theme.textSecondary }]}>
                Welcome to the Spinal Hub community. By participating you agree to the following terms:
              </ThemedText>

              {[
                "Be respectful and supportive — this is a space for people living with spinal cord injuries and their carers.",
                "No hate speech, harassment, bullying, or discriminatory content of any kind.",
                "Do not share another person's private information without their consent.",
                "Do not post spam, advertisements, or promotional content.",
                "Medical information shared here is not professional advice. Always consult a qualified health professional.",
                "You can report any message that violates these guidelines using the long-press menu.",
                "You can block any user whose content you do not wish to see.",
                "Reports are reviewed by the Spinal Hub team within 24 hours. Violating content will be removed and repeat offenders will be banned.",
              ].map((rule, i) => (
                <View key={i} style={styles.ruleRow}>
                  <ThemedText style={{ color: theme.primary, fontWeight: "700" }}>{i + 1}.{"  "}</ThemedText>
                  <ThemedText type="body" style={[styles.ruleText, { color: theme.text }]}>{rule}</ThemedText>
                </View>
              ))}

              <ThemedText type="small" style={[styles.modalFooter, { color: theme.textSecondary }]}>
                By tapping "I Agree" you confirm you have read and agree to these community guidelines and our{" "}
                <ThemedText type="small" style={{ color: theme.primary }}>Privacy Policy</ThemedText>.
              </ThemedText>
            </ScrollView>

            <Pressable
              onPress={handleAcceptGuidelines}
              style={[styles.agreeBtn, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityLabel="I agree to community guidelines"
            >
              <ThemedText style={styles.agreeBtnText}>I Agree</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 16,
    maxHeight: "85%",
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 380,
    marginBottom: Spacing.lg,
  },
  modalBody: {
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  ruleRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  ruleText: {
    flex: 1,
    lineHeight: 21,
  },
  modalFooter: {
    lineHeight: 18,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  agreeBtn: {
    borderRadius: BorderRadius.medium,
    paddingVertical: 14,
    alignItems: "center",
  },
  agreeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
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
