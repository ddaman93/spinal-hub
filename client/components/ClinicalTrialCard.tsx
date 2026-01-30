import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import type { ClinicalTrialItem } from "@/data/clinicalTrials";
import { useBookmarks } from "@/hooks/useBookmarks";

const STAGE_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  Recruiting: {
    bg: "rgba(60, 179, 113, 0.25)",
    text: "#3CB371",
  },
  "Early Human": {
    bg: "rgba(70, 130, 180, 0.25)",
    text: "#4682B4",
  },
  Ongoing: {
    bg: "rgba(255, 165, 0, 0.25)",
    text: "#FFA500",
  },
  "Pre-clinical": {
    bg: "rgba(255,255,255,0.15)",
    text: "rgba(255,255,255,0.85)",
  },
};

const STAGE_ICONS: Record<
  string,
  keyof typeof Feather.glyphMap
> = {
  Recruiting: "play-circle",
  "Early Human": "activity",
  Ongoing: "loader",
  "Pre-clinical": "flask",
};

type Props = {
  item: ClinicalTrialItem;
  onPress?: () => void;
};

export function ClinicalTrialCard({ item, onPress }: Props) {
  const { theme } = useTheme();
  const stageStyle =
    STAGE_COLORS[item.stage] ?? STAGE_COLORS["Pre-clinical"];
  // Bookmark logic
  const { toggle, isSaved } = useBookmarks();
  const saved = isSaved("clinicalTrials", item.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      {/* Save button */}
      <Pressable
        onPress={() => toggle("clinicalTrials", item.id)}
        style={[styles.saveButton, { backgroundColor: theme.backgroundSecondary }]}
        hitSlop={10}
      >
        <Feather
          name="bookmark"
          size={18}
          color={saved ? theme.primary : theme.textSecondary}
        />
      </Pressable>

      {/* Title */}
      <ThemedText type="heading" numberOfLines={2}>
        {item.title}
      </ThemedText>

      {/* Summary */}
      <ThemedText
        type="small"
        numberOfLines={3}
        style={{ color: theme.textSecondary }}
      >
        {item.summary}
      </ThemedText>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                stageStyle.bg && stageStyle.bg.includes("255,255,255")
                  ? theme.backgroundTertiary
                  : stageStyle.bg ?? theme.backgroundTertiary,
            },
          ]}
        >
          <ThemedText
            type="caption"
            style={{ color: stageStyle.text && !stageStyle.text.includes("255,255,255") ? stageStyle.text : theme.text }}
          >
            {item.stage}
          </ThemedText>
        </View>

        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {item.location}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280, // IMPORTANT for horizontal scroll
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
    position: "relative",
  },

  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  saveButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    borderRadius: 999,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },

  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
});