import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import type { ClinicalTrialItem } from "@/data/clinicalTrials";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.get("/clinical-trials", async (_req, res) => {
  try {
    const response = await fetch(
      "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=10"
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch clinical trials",
    });
  }
});

export default router;

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
        pressed && styles.pressed,
      ]}
    >
      {/* Save button */}
      <Pressable
        onPress={() => toggle("clinicalTrials", item.id)}
        style={styles.saveButton}
        hitSlop={10}
      >
        <Feather
          name="bookmark"
          size={18}
          color={saved ? "#4DA3FF" : "rgba(255,255,255,0.85)"}
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
        style={{ opacity: 0.85 }}
      >
        {item.summary}
      </ThemedText>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: stageStyle.bg },
          ]}
        >
          <ThemedText
            type="caption"
            style={{ color: stageStyle.text }}
          >
            {item.stage}
          </ThemedText>
        </View>

        <ThemedText type="caption" style={{ opacity: 0.7 }}>
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
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
    backgroundColor: "rgba(0,0,0,0.35)",
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
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});