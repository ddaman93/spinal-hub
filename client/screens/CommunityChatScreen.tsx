import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";

const GUIDELINES_ACCEPTED_KEY = "community_guidelines_accepted_v1";
const LAST_READ_KEY = "chat_last_read_v1";

type Channel = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
};

type Preview = { lastText: string | null; lastAuthor: string | null; lastTs: string | null; unread: boolean };

const CHANNELS: Channel[] = [
  { id: "general", name: "General", description: "Open discussion", icon: "message-circle", color: "#007AFF" },
  { id: "equipment-tech", name: "Equipment & Tech", description: "Wheelchairs & gear", icon: "settings", color: "#5C6BC0" },
  { id: "care-companies", name: "Care Companies", description: "Carer provider reviews", icon: "users", color: "#34C759" },
  { id: "transport", name: "Transport", description: "Accessible transport tips", icon: "navigation", color: "#1C7ED6" },
  { id: "health-wellness", name: "Health & Wellness", description: "Routines and tips", icon: "heart", color: "#FF6B6B" },
  { id: "research-trials", name: "Research", description: "SCI research news", icon: "activity", color: "#AF52DE" },
  { id: "spinal-units", name: "Spinal Units", description: "Rehab unit experiences", icon: "crosshair", color: "#FF9500" },
  { id: "acc", name: "ACC", description: "Funding & entitlements", icon: "briefcase", color: "#30B0C7" },
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CommunityChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [previews, setPreviews] = useState<Record<string, Preview>>({});

  useEffect(() => {
    AsyncStorage.getItem(GUIDELINES_ACCEPTED_KEY).then((val) => {
      if (!val) setShowGuidelines(true);
    });
  }, []);

  const handleAcceptGuidelines = async () => {
    await AsyncStorage.setItem(GUIDELINES_ACCEPTED_KEY, "1");
    setShowGuidelines(false);
  };

  // Load previews + unread state on every focus
  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => {
      const base = getApiUrl();
      const lastReadRaw = await AsyncStorage.getItem(LAST_READ_KEY);
      const lastRead: Record<string, string> = lastReadRaw ? JSON.parse(lastReadRaw) : {};

      await Promise.all(CHANNELS.map(async (ch) => {
        try {
          const res = await fetch(`${base}/api/chat/${ch.id}`);
          if (!res.ok) return;
          const rows: Array<{ author: string; text: string; timestamp: string }> = await res.json();
          if (rows.length === 0) return;
          const last = rows[rows.length - 1];
          const lr = lastRead[ch.id];
          const unread = !lr || new Date(last.timestamp).getTime() > new Date(lr).getTime();
          if (!active) return;
          setPreviews((prev) => ({
            ...prev,
            [ch.id]: { lastText: last.text, lastAuthor: last.author, lastTs: last.timestamp, unread },
          }));
        } catch {}
      }));
    })();
    return () => { active = false; };
  }, []));

  return (
    <ThemedView style={styles.container}>
      <Modal visible={showGuidelines} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.modalTitle}>Community Guidelines</ThemedText>
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
                "Reports are reviewed by the Spinal Hub team within 24 hours.",
              ].map((rule, i) => (
                <View key={i} style={styles.ruleRow}>
                  <ThemedText style={{ color: theme.primary, fontWeight: "700" }}>{i + 1}.{"  "}</ThemedText>
                  <ThemedText type="body" style={[styles.ruleText, { color: theme.text }]}>{rule}</ThemedText>
                </View>
              ))}
              <ThemedText type="small" style={[styles.modalFooter, { color: theme.textSecondary }]}>
                By tapping "I Agree" you confirm you have read and agree to these guidelines and our{" "}
                <ThemedText type="small" style={{ color: theme.primary }}>Privacy Policy</ThemedText>.
              </ThemedText>
            </ScrollView>
            <Pressable
              onPress={handleAcceptGuidelines}
              style={[styles.agreeBtn, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
            >
              <ThemedText style={styles.agreeBtnText}>I Agree</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]}>
          A space for the SCI community to connect and share. Be respectful and supportive.
        </ThemedText>

        <View style={styles.grid}>
          {CHANNELS.map((channel) => {
            const p = previews[channel.id];
            const preview = p?.lastText
              ? (p.lastAuthor ? `${p.lastAuthor}: ${p.lastText}` : p.lastText)
              : "No messages yet";
            return (
              <Pressable
                key={channel.id}
                onPress={() => navigation.navigate("ChatRoom", { channelId: channel.id, channelName: channel.name })}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isDark ? "#161A16" : "#fff",
                    borderColor: p?.unread ? channel.color : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                    borderWidth: p?.unread ? 1.5 : StyleSheet.hairlineWidth,
                  },
                  pressed && { opacity: 0.75 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${channel.name} channel${p?.unread ? ", unread" : ""}`}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: channel.color }]}>
                    <Feather name={channel.icon} size={16} color="#fff" />
                  </View>
                  {p?.unread && <View style={[styles.unreadDot, { backgroundColor: channel.color }]} />}
                </View>

                <ThemedText type="body" style={styles.cardName} numberOfLines={1}>{channel.name}</ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.cardPreview, { color: p?.unread ? theme.text : theme.textSecondary, fontWeight: p?.unread ? "600" : "400" }]}
                  numberOfLines={2}
                >
                  {preview}
                </ThemedText>
                <ThemedText type="small" style={[styles.cardTime, { color: theme.textSecondary }]}>
                  {p?.lastTs ? timeAgo(p.lastTs) : channel.description}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: Spacing.xl + 16, maxHeight: "85%" },
  modalTitle: { fontWeight: "700", marginBottom: Spacing.md, textAlign: "center" },
  modalScroll: { maxHeight: 380, marginBottom: Spacing.lg },
  modalBody: { lineHeight: 22, marginBottom: Spacing.md },
  ruleRow: { flexDirection: "row", marginBottom: Spacing.sm },
  ruleText: { flex: 1, lineHeight: 21 },
  modalFooter: { lineHeight: 18, marginTop: Spacing.md, textAlign: "center" },
  agreeBtn: { borderRadius: BorderRadius.medium, paddingVertical: 14, alignItems: "center" },
  agreeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  scrollContent: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  subtitle: { lineHeight: 20, opacity: 0.8, paddingHorizontal: Spacing.xs },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  card: {
    width: "48.5%",
    minHeight: 150,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  cardName: { fontWeight: "700", fontSize: 14, marginTop: 3 },
  cardPreview: { fontSize: 11, lineHeight: 14, minHeight: 28 },
  cardTime: { fontSize: 10, opacity: 0.7 },
});
