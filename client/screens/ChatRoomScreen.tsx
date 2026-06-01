import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { useRoute, RouteProp, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken, getUserIdFromToken } from "@/lib/auth";
import { PROFILE_STORAGE_KEY } from "@/screens/ProfileScreen";
import { UserProfile } from "@/types/user";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const USE_REALTIME = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

type RouteProps = RouteProp<MainStackParamList, "ChatRoom">;

type Message = {
  id: string;
  channel: string;
  authorId: string | null;
  author: string;
  text: string;
  timestamp: string;
  pending?: boolean;
  failed?: boolean;
};

const POLL_INTERVAL = 2000;
const GROUP_GAP_MS = 5 * 60 * 1000;
const BLOCKED_AUTHORS_KEY = "blocked_authors_v1";
const LAST_READ_KEY = "chat_last_read_v1";
const MY_IDS_KEY = "chat_my_message_ids_v1";
const DELETED_MARKER = "[deleted]";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

async function writeLastRead(channelId: string, iso: string) {
  try {
    const raw = await AsyncStorage.getItem(LAST_READ_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[channelId] = iso;
    await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(map));
  } catch {}
}

async function loadMyIds(channelId: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(MY_IDS_KEY);
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    return new Set(map[channelId] ?? []);
  } catch { return new Set(); }
}

async function addMyId(channelId: string, id: string) {
  try {
    const raw = await AsyncStorage.getItem(MY_IDS_KEY);
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const list = map[channelId] ?? [];
    if (!list.includes(id)) list.push(id);
    map[channelId] = list.slice(-500); // cap
    await AsyncStorage.setItem(MY_IDS_KEY, JSON.stringify(map));
  } catch {}
}

export default function ChatRoomScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<RouteProps>();
  const isFocused = useIsFocused();
  const { channelId, channelName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [authorName, setAuthorName] = useState("Anonymous");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockedAuthors, setBlockedAuthors] = useState<Set<string>>(new Set());
  const [mySentIds, setMySentIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const listRef = useRef<FlatList>(null);
  const latestTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
      if (raw) {
        const profile: UserProfile = JSON.parse(raw);
        if (profile.name?.trim()) setAuthorName(profile.name.trim());
      }
    });
    AsyncStorage.getItem(BLOCKED_AUTHORS_KEY).then((raw) => {
      if (raw) setBlockedAuthors(new Set(JSON.parse(raw) as string[]));
    });
    getToken().then((tok) => {
      if (tok) setMyUserId(getUserIdFromToken(tok));
    });
    loadMyIds(channelId).then(setMySentIds);
  }, [channelId]);

  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const base = getApiUrl();
      const url = latestTimestampRef.current && !initial
        ? `${base}/api/chat/${channelId}?since=${encodeURIComponent(latestTimestampRef.current)}`
        : `${base}/api/chat/${channelId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      const data: Message[] = await res.json();

      if (initial) {
        if (data.length > 0) latestTimestampRef.current = data[data.length - 1].timestamp;
        setMessages(data);
      } else if (data.length > 0) {
        latestTimestampRef.current = data[data.length - 1].timestamp;
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnes = data.filter((m) => !existingIds.has(m.id));
          // also reconcile edits by id (replace if text differs)
          const merged = prev.map((m) => {
            const updated = data.find((d) => d.id === m.id);
            return updated ? { ...m, text: updated.text } : m;
          });
          return newOnes.length > 0 ? [...merged, ...newOnes] : merged;
        });
      }
      setError(null);
    } catch {
      if (initial) setError("Could not load messages. Is the server running?");
    } finally {
      if (initial) setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  // Polling — only when focused
  useEffect(() => {
    if (USE_REALTIME) return;
    if (!isFocused) return;
    const id = setInterval(() => fetchMessages(false), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMessages, isFocused]);

  // Supabase Realtime (optional)
  useEffect(() => {
    if (!USE_REALTIME) return;
    let channel: any = null;
    (async () => {
      try {
        // @ts-ignore — optional dep
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
        channel = supabase
          .channel(`chat:${channelId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel=eq.${channelId}` },
            (payload: { new: Record<string, unknown> }) => {
              const row = payload.new;
              const msg: Message = {
                id: row.id as string,
                channel: row.channel as string,
                authorId: (row.author_id as string) ?? null,
                author: row.author_name as string,
                text: row.text as string,
                timestamp: row.created_at as string,
              };
              setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]));
            },
          )
          .subscribe();
      } catch {}
    })();
    return () => { channel?.unsubscribe(); };
  }, [channelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // Write lastRead on blur and on unmount
  useEffect(() => {
    if (!isFocused && messages.length > 0) {
      writeLastRead(channelId, messages[messages.length - 1].timestamp);
    }
  }, [isFocused, channelId, messages]);

  useEffect(() => {
    return () => {
      if (messages.length > 0) writeLastRead(channelId, messages[messages.length - 1].timestamp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMine = useCallback((m: Message) => {
    if (mySentIds.has(m.id)) return true;
    if (myUserId && m.authorId) return m.authorId === myUserId;
    return m.author === authorName;
  }, [mySentIds, myUserId, authorName]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    // Edit path
    if (editingId) {
      const originalId = editingId;
      const original = messages.find((m) => m.id === originalId);
      if (!original) { setEditingId(null); setInputText(""); return; }
      setSending(true);
      setInputText("");
      setEditingId(null);
      setMessages((prev) => prev.map((m) => (m.id === originalId ? { ...m, text } : m)));
      try {
        const base = getApiUrl();
        const token = await getToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${base}/api/chat/message/${originalId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
      } catch {
        setMessages((prev) => prev.map((m) => (m.id === originalId ? { ...m, text: original.text } : m)));
        Alert.alert("Edit failed", "Could not update message.");
      } finally {
        setSending(false);
      }
      return;
    }

    // Send path with optimistic UI
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      channel: channelId,
      authorId: myUserId,
      author: authorName,
      text,
      timestamp: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputText("");
    setSending(true);
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
      const real: Message = await res.json();
      latestTimestampRef.current = real.timestamp;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...real, pending: false } : m)));
      setMySentIds((prev) => new Set(prev).add(real.id));
      addMyId(channelId, real.id);
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  const retrySend = useCallback(async (msg: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, pending: true, failed: false } : m)));
    try {
      const base = getApiUrl();
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${base}/api/chat/${channelId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ author: msg.author, text: msg.text }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const real: Message = await res.json();
      latestTimestampRef.current = real.timestamp;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...real, pending: false } : m)));
      setMySentIds((prev) => new Set(prev).add(real.id));
      addMyId(channelId, real.id);
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, pending: false, failed: true } : m)));
    }
  }, [channelId]);

  const handleBlockAuthor = useCallback(async (a: string) => {
    const updated = new Set(blockedAuthors);
    updated.add(a);
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
          messageId: item.id, channel: item.channel,
          reportedAuthor: item.author, messageText: item.text,
        }),
      });
      Alert.alert("Report Submitted", "Thank you. Our team will review this message within 24 hours.");
    } catch {
      Alert.alert("Error", "Could not submit report. Please try again.");
    }
  }, []);

  const handleEdit = useCallback((item: Message) => {
    setEditingId(item.id);
    setInputText(item.text);
  }, []);

  const handleDelete = useCallback(async (item: Message) => {
    Alert.alert("Delete message?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          const prev = item.text;
          setMessages((cur) => cur.map((m) => (m.id === item.id ? { ...m, text: DELETED_MARKER } : m)));
          try {
            const base = getApiUrl();
            const token = await getToken();
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await fetch(`${base}/api/chat/message/${item.id}`, { method: "DELETE", headers });
            if (!res.ok) throw new Error(`${res.status}`);
          } catch {
            setMessages((cur) => cur.map((m) => (m.id === item.id ? { ...m, text: prev } : m)));
            Alert.alert("Delete failed", "Could not delete message.");
          }
        }
      },
    ]);
  }, []);

  const handleLongPress = useCallback((item: Message) => {
    if (item.text === DELETED_MARKER) return;
    const mine = isMine(item);
    const options = mine
      ? ["Edit", "Delete", "Cancel"]
      : ["Report Message", `Block ${item.author}`, "Cancel"];
    const cancelButtonIndex = 2;
    const destructiveButtonIndex = mine ? 1 : 0;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex, destructiveButtonIndex, title: "Message Options" },
        (index) => {
          if (mine) {
            if (index === 0) handleEdit(item);
            if (index === 1) handleDelete(item);
          } else {
            if (index === 0) handleReportMessage(item);
            if (index === 1) handleBlockAuthor(item.author);
          }
        }
      );
    } else {
      Alert.alert("Message Options", undefined, mine ? [
        { text: "Edit", onPress: () => handleEdit(item) },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(item) },
        { text: "Cancel", style: "cancel" },
      ] : [
        { text: "Report Message", style: "destructive", onPress: () => handleReportMessage(item) },
        { text: `Block ${item.author}`, onPress: () => handleBlockAuthor(item.author) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, [isMine, handleReportMessage, handleBlockAuthor, handleEdit, handleDelete]);

  const visibleMessages = useMemo(
    () => messages.filter((m) => !blockedAuthors.has(m.author)),
    [messages, blockedAuthors]
  );

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const mine = isMine(item);
    const prevItem = visibleMessages[index - 1];
    const nextItem = visibleMessages[index + 1];

    const curDate = formatDate(item.timestamp);
    const showDateSep = !prevItem || curDate !== formatDate(prevItem.timestamp);

    // Grouping: same author + within GROUP_GAP_MS
    const sameAuthorAsPrev = prevItem && prevItem.author === item.author && !showDateSep &&
      new Date(item.timestamp).getTime() - new Date(prevItem.timestamp).getTime() < GROUP_GAP_MS;
    const sameAuthorAsNext = nextItem && nextItem.author === item.author &&
      formatDate(nextItem.timestamp) === curDate &&
      new Date(nextItem.timestamp).getTime() - new Date(item.timestamp).getTime() < GROUP_GAP_MS;

    const isFirstInGroup = !sameAuthorAsPrev;
    const isLastInGroup = !sameAuthorAsNext;
    const isDeleted = item.text === DELETED_MARKER;

    // Asymmetric radii for bubble grouping
    const topR = isFirstInGroup ? 16 : 6;
    const botR = isLastInGroup ? 16 : 6;
    const radii = mine
      ? { borderTopLeftRadius: 16, borderTopRightRadius: topR, borderBottomLeftRadius: 16, borderBottomRightRadius: isLastInGroup ? 4 : botR }
      : { borderTopLeftRadius: topR, borderTopRightRadius: 16, borderBottomLeftRadius: isLastInGroup ? 4 : botR, borderBottomRightRadius: 16 };

    const bubbleBg = mine ? theme.primary : (isDark ? "#1F2A22" : "#EEF2EE");
    const textColor = mine ? "#fff" : theme.text;
    const subColor = mine ? "rgba(255,255,255,0.7)" : theme.textSecondary;

    return (
      <View>
        {showDateSep && (
          <View style={styles.dateSepWrap}>
            <View style={[styles.dateSepPill, { backgroundColor: isDark ? "#1A1F1A" : "#E5E9E5" }]}>
              <ThemedText style={[styles.dateSepText, { color: theme.textSecondary }]}>{curDate}</ThemedText>
            </View>
          </View>
        )}
        <Pressable
          onLongPress={() => handleLongPress(item)}
          delayLongPress={350}
          style={[
            styles.row,
            mine ? styles.rowMe : styles.rowOther,
            { marginTop: isFirstInGroup ? Spacing.sm : 2 },
          ]}
        >
          {!mine && (
            <View style={{ width: 32 }}>
              {isLastInGroup && <Avatar name={item.author} size={32} />}
            </View>
          )}
          <View style={{ maxWidth: "75%", alignItems: mine ? "flex-end" : "flex-start" }}>
            {!mine && isFirstInGroup && (
              <ThemedText style={[styles.authorLabel, { color: theme.textSecondary }]}>
                {item.author}
              </ThemedText>
            )}
            <View style={[styles.bubble, radii, { backgroundColor: bubbleBg, opacity: item.pending ? 0.6 : 1 }]}>
              <ThemedText style={[styles.bubbleText, { color: textColor, fontStyle: isDeleted ? "italic" : "normal", opacity: isDeleted ? 0.6 : 1 }]}>
                {isDeleted ? "message deleted" : item.text}
              </ThemedText>
              {isLastInGroup && !isDeleted && (
                <View style={styles.metaRow}>
                  <ThemedText style={[styles.timeText, { color: subColor }]}>
                    {formatTime(item.timestamp)}
                  </ThemedText>
                  {item.pending && <Feather name="clock" size={10} color={subColor} style={{ marginLeft: 4 }} />}
                  {item.failed && (
                    <Pressable onPress={() => retrySend(item)} hitSlop={8} style={{ marginLeft: 6, flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Feather name="alert-circle" size={11} color="#EF4444" />
                      <ThemedText style={[styles.timeText, { color: "#EF4444" }]}>Retry</ThemedText>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const inputBg = isDark ? "#1C1C1E" : "#F2F2F7";
  const isEditing = editingId !== null;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Feather name="wifi-off" size={40} color={theme.textSecondary} />
            <ThemedText type="body" style={[styles.errorText, { color: theme.textSecondary }]}>{error}</ThemedText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={visibleMessages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messageList,
              { paddingTop: headerHeight + Spacing.sm },
              visibleMessages.length === 0 && styles.messageListEmpty,
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

        {isEditing && (
          <View style={[styles.editBanner, { backgroundColor: isDark ? "#1F2A22" : "#EEF7F0", borderColor: theme.primary }]}>
            <Feather name="edit-2" size={12} color={theme.primary} />
            <ThemedText style={[styles.editBannerText, { color: theme.primary }]}>Editing message</ThemedText>
            <Pressable onPress={() => { setEditingId(null); setInputText(""); }} hitSlop={8}>
              <Feather name="x" size={14} color={theme.primary} />
            </Pressable>
          </View>
        )}

        <View style={[styles.inputBar, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.border }]}>
          <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={isEditing ? "Edit your message…" : `Message #${channelName.toLowerCase()}…`}
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? theme.primary : (isDark ? "#2A2F2A" : "#D5DAD5") },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? "Save edit" : "Send message"}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name={isEditing ? "check" : "arrow-up"} size={18} color="#fff" />
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.md, padding: Spacing.xl },
  errorText: { textAlign: "center", lineHeight: 22 },
  emptyText: { textAlign: "center", lineHeight: 22, opacity: 0.6 },

  messageList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  messageListEmpty: { flex: 1 },

  dateSepWrap: { alignItems: "center", marginVertical: Spacing.md },
  dateSepPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dateSepText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },

  row: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  rowMe: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },

  authorLabel: { fontSize: 11, fontWeight: "600", marginBottom: 2, marginLeft: 4, opacity: 0.85 },

  bubble: { paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  metaRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", marginTop: 2 },
  timeText: { fontSize: 10, opacity: 0.85 },

  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editBannerText: { flex: 1, fontSize: 12, fontWeight: "600" },

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
    borderRadius: 22,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    maxHeight: 120,
    minHeight: 40,
    justifyContent: "center",
  },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
});
