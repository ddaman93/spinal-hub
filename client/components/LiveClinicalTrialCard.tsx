import React from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";

type Props = {
  id: string;
  title: string;
  status: string;
  phase?: string;
  summary?: string;
  country?: string;

  // NEW: controls sizing + typography
  variant?: "carousel" | "grid";
};

export function LiveClinicalTrialCard({
  id,
  title,
  status,
  phase,
  summary,
  country,
  variant = "carousel",
}: Props) {
  const isRecruiting = status.toLowerCase().includes("recruiting");

  return (
    <Pressable
      onPress={() => Linking.openURL(`https://clinicaltrials.gov/study/${id}`)}
      style={({ pressed }) => [
        styles.cardBase,
        variant === "carousel" ? styles.cardCarousel : styles.cardGrid,
        pressed && { opacity: 0.88 },
      ]}
    >
      {/* TITLE */}
      <ThemedText
        type="small"
        numberOfLines={variant === "carousel" ? 3 : 2}
        style={[
          styles.title,
          variant === "carousel" && styles.carouselTitle,
        ]}
      >
        {title}
      </ThemedText>

      {/* SUMMARY */}
      {summary ? (
        <ThemedText
          type={variant === "carousel" ? "small" : "caption"}
          numberOfLines={variant === "carousel" ? 3 : 2}
          style={styles.description}
        >
          {summary}
        </ThemedText>
      ) : null}

      {/* META ROW */}
      <View style={styles.metaRow}>
        <View
          style={[
            styles.badge,
            isRecruiting ? styles.recruiting : styles.notRecruiting,
          ]}
        >
          <ThemedText type="small">
            {status.replace(/_/g, " ")}
          </ThemedText>
        </View>

        {phase ? (
          <ThemedText type="small" style={styles.metaText}>
            {phase}
          </ThemedText>
        ) : null}

        {country ? (
          <ThemedText type="small" style={styles.metaText}>
            {country}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 18,
    padding: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // Dashboard horizontal carousel: fixed width feels good
  cardCarousel: {
    width: 300,
  },

  // Grid/list: must fill container width (no fixed width)
  cardGrid: {
    width: "100%",
  },

  title: {
    fontSize: 15,        // 👈 smaller, more readable
    fontWeight: "600",
    lineHeight: 20,
  },

  carouselTitle: {
    fontSize: 14,        // 👈 slightly tighter for dashboard
  },

  description: {
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",          // IMPORTANT: prevents overflow
    alignItems: "center",
    gap: Spacing.sm,
  },

  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },

  recruiting: {
    backgroundColor: "rgba(0,200,150,0.25)",
  },

  notRecruiting: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  metaText: {
    opacity: 0.65,
  },
});