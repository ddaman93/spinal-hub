import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type Category = { id: string; label: string; icon: keyof typeof Feather.glyphMap; color: string };

const CATEGORIES: Category[] = [
  { id: "feature", label: "Feature Request", icon: "star", color: "#007AFF" },
  { id: "bug", label: "Something's Broken", icon: "alert-circle", color: "#FF3B30" },
  { id: "general", label: "General Feedback", icon: "message-circle", color: "#34C759" },
];

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();

  const [category, setCategory] = useState("feature");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Add a message", "Please tell us what's on your mind before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${getApiUrl()}/api/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({ category, message: message.trim() }),
      });

      if (!res.ok) throw new Error(`${res.status}`);

      setMessage("");
      Alert.alert(
        "Thanks for your feedback!",
        "We read every submission and use it to make Spinal Hub better.",
        [{ text: "Done" }]
      );
    } catch {
      Alert.alert("Couldn't send feedback", "Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBg = isDark ? "#1C1C1E" : "#F2F2F7";

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="body" style={[styles.intro, { color: theme.textSecondary }]}>
            Got an idea or spotted something wrong? We want to hear it. Let us know what you'd like to see added, changed, or fixed.
          </ThemedText>

          {/* Category picker */}
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            WHAT TYPE OF FEEDBACK?
          </ThemedText>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.catBtn,
                    { backgroundColor: selected ? cat.color : theme.backgroundDefault },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={cat.label}
                >
                  <Feather name={cat.icon} size={16} color={selected ? "#fff" : theme.textSecondary} />
                  <ThemedText
                    type="small"
                    style={[styles.catLabel, { color: selected ? "#fff" : theme.text }]}
                  >
                    {cat.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Message */}
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            YOUR MESSAGE
          </ThemedText>
          <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Tell us what you think should be added, improved, or fixed…"
              placeholderTextColor={theme.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={2000}
              textAlignVertical="top"
              accessibilityLabel="Feedback message"
            />
          </View>
          <ThemedText type="small" style={[styles.charCount, { color: theme.textSecondary }]}>
            {message.length} / 2000
          </ThemedText>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: theme.primary },
              submitting && { opacity: 0.6 },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Submit feedback"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="send" size={18} color="#fff" />
                <ThemedText style={styles.submitText}>Send Feedback</ThemedText>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  intro: {
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  label: {
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categories: {
    gap: Spacing.sm,
  },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  catLabel: {
    fontWeight: "500",
    fontSize: 14,
  },
  inputWrap: {
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    minHeight: 160,
  },
  input: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 140,
  },
  charCount: {
    textAlign: "right",
    opacity: 0.5,
    fontSize: 11,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.lg,
    minHeight: 52,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
