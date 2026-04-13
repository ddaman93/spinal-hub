import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { PROFILE_STORAGE_KEY } from "@/screens/ProfileScreen";
import { UserProfile } from "@/types/user";

// Supabase Realtime (optional — requires EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const USE_REALTIME = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

type RouteProps = RouteProp<MainStackParamList, "ChatRoom">;

type Message = {
  id: string;
  channel: string;
  author: string;
  text: string;
  timestamp: string;
};

const POLL_INTERVAL = 5000;
const BLOCKED_AUTHORS_KEY = "blocked_authors_v1";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatRoomScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<RouteProps>();
  const { channelId, channelName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [authorName, setAuthorName] = useState("Anonymous");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockedAuthors, setBlockedAuthors] = useState<Set<string>>(new Set());

  const listRef = useRef<FlatList>(null);
  const latestTimestampRef = useRef<string | null>(null);

  // Load author name from profile and blocked authors list
  useEffect(() => {
    AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
      if (raw) {
        const profile: UserProfile = JSON.parse(raw);
        if (profile.name?.trim()) setAuthorName(profile.name.trim());
      }
    });
    AsyncStorage.getItem(BLOCKED_AUTHORS_KEY).then((raw) => {
      if (raw) {
        setBlockedAuthors(new Set(JSON.parse(raw) as string[]));
      }
    });
  }, []);

  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const base = getApiUrl();
      const url = latestTimestampRef.current && !initial
        ? `${base}/api/chat/${channelId}?since=${encodeURIComponent(latestTimestampRef.current)}`
        : `${base}/api/chat/${channelId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      const data: Message[] = await res.json();

      if (data.length > 0) {
        latestTimestampRef.current = data[data.length - 1].timestamp;
        setMessages((prev) => {
          if (initial) return data;
          // Dedupe by id
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnes = data.filter((m) => !existingIds.has(m.id));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      }
      setError(null);
    } catch {
      if (initial) setError("Could not load messages. Is the server running?");
    } finally {
      if (initial) setLoading(false);
    }
  }, [channelId]);

  // Initial load
  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  // Real-time subscription (Supabase) or polling fallback
  useEffect(() => {
    if (USE_REALTIME) {
      // Supabase Realtime — import lazily so the module is optional
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let channel: any = null;
      (async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — installed only when Supabase env vars are configured
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
          channel = supabase
            .channel(`chat:${channelId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: `channel=eq.${channelId}`,
              },
              (payload: { new: Record<string, unknown> }) => {
                const row = payload.new;
                const msg: Message = {
                  id: row.id as string,
                  channel: row.channel as string,
                  author: row.author_name as string,
                  text: row.text as string,
                  timestamp: row.created_at as string,
                };
                setMessages((prev) => {
                  if (prev.find((m) => m.id === msg.id)) return prev;
                  return [...prev, msg];
                });
              },
            )
            .subscribe();
        } catch {
          // Fallback to polling if Supabase module not installed
          const id = setInterval(() => fetchMessages(false), POLL_INTERVAL);
          return () => clearInterval(id);
        }
      })();
      return () => {
        channel?.unsubscribe();
      };
    }

    // Polling fallback
    const id = setInterval(() => fetchMessages(false), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMessages, channelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText("");
    try {
      const base = getApiUrl();
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${base}/api/chat/${channelId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ author: authorName, text }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const newMessage: Message = await res.json();
      latestTimestampRef.current = newMessage.timestamp;
      setMessages((prev) => [...prev, newMessage]);
    } catch {
      setInputText(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleBlockAuthor = useCallback(async (authorToBlock: string) => {
    const updated = new Set(blockedAuthors);
    updated.add(authorToBlock);
    setBlockedAuthors(updated);
    await AsyncStorage.setItem(BLOCKED_AUTHORS_KEY, JSON.stringify([...updated]));
  }, [blockedAuthors]);

  const handleReportMessage = useCallback(async (item: Message) => {
    try {
      const base = getApiUrl();
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${base}/api/chat/report`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messageId: item.id,
          channel: item.channel,
          reportedAuthor: item.author,
          messageText: item.text,
        }),
      });
      Alert.alert(
        "Report Submitted",
        "Thank you. Our team will review this message within 24 hours.",
        [{ text: "OK" }]
      );
    } catch {
      Alert.alert("Error", "Could not submit report. Please try again.");
    }
  }, []);

  const handleLongPress = useCallback((item: Message) => {
    if (item.author === authorName) return; // Can't report/block yourself

    const options = ["Report Message", `Block ${item.author}`, "Cancel"];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: 0,
          title: "Message Options",
        },
        (index) => {
          if (index === 0) handleReportMessage(item);
          if (index === 1) handleBlockAuthor(item.author);
        }
      );
    } else {
      Alert.alert("Message Options", undefined, [
        { text: "Report Message", style: "destructive", onPress: () => handleReportMessage(item) },
        { text: `Block ${item.author}`, onPress: () => handleBlockAuthor(item.author) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, [authorName, handleReportMessage, handleBlockAuthor]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.author === authorName;
    const prevItem = messages[index - 1];
    const showDateSep =
      !prevItem ||
      formatDate(item.timestamp) !== formatDate(prevItem.timestamp);

    return (
      <>
        {showDateSep && (
          <View style={styles.dateSep}>
            <ThemedText type="small" style={[styles.dateSepText, { color: theme.textSecondary }]}>
              {formatDate(item.timestamp)}
            </ThemedText>
          </View>
        )}
        <Pressable
          style={[styles.messageRow, isMe && styles.messageRowMe]}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={400}
          accessible={false}
        >
          {!isMe && (
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.avatarText}>
                {item.author.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={[
            styles.bubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: theme.primary }]
              : [styles.bubbleOther, { backgroundColor: theme.backgroundDefault }],
          ]}>
            {!isMe && (
              <ThemedText type="small" style={[styles.bubbleAuthor, { color: theme.primary }]}>
                {item.author}
              </ThemedText>
            )}
            <ThemedText style={[styles.bubbleText, isMe && { color: "#fff" }]}>
              {item.text}
            </ThemedText>
            <ThemedText
              type="small"
              style={[
                styles.bubbleTime,
                { color: isMe ? "rgba(255,255,255,0.7)" : theme.textSecondary },
              ]}
            >
              {formatTime(item.timestamp)}
            </ThemedText>
          </View>
        </Pressable>
      </>
    );
  };

  const inputBg = isDark ? "#1C1C1E" : "#F2F2F7";

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Feather name="wifi-off" size={40} color={theme.textSecondary} />
            <ThemedText type="body" style={[styles.errorText, { color: theme.textSecondary }]}>
              {error}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages.filter((m) => !blockedAuthors.has(m.author))}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messageList,
              { paddingTop: headerHeight },
              messages.length === 0 && styles.messageListEmpty,
            ]}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="message-circle" size={44} color={theme.textSecondary} style={{ opacity: 0.4 }} />
                <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No messages yet.{"\n"}Be the first to post!
                </ThemedText>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.border }]}>
          <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={`Message #${channelName.toLowerCase()}…`}
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: theme.primary },
              (!inputText.trim() || sending) && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={18} color="#fff" />
            )}
          </Pressable>
        </View>

        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  errorText: {
    textAlign: "center",
    lineHeight: 22,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.6,
  },
  messageList: {
    padding: Spacing.md,
    gap: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  messageListEmpty: {
    flex: 1,
  },
  dateSep: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  dateSepText: {
    opacity: 0.5,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: BorderRadius.medium,
    padding: Spacing.sm,
    gap: 3,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleAuthor: {
    fontWeight: "700",
    fontSize: 11,
    opacity: 0.9,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTime: {
    fontSize: 10,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  inputWrap: {
    flex: 1,
    borderRadius: BorderRadius.large,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
});
