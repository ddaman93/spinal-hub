import React from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

type Props = {
  id: string;
  title: string;
  status: string;
  phase?: string;
  summary?: string;
  countries?: string[];
  source?: "clinicaltrials.gov" | "anzctr";
  url?: string;
  variant?: "carousel" | "grid";
};

const SOURCE_LABEL: Record<string, string> = {
  "clinicaltrials.gov": "CTG",
  anzctr: "ANZCTR",
};

export function LiveClinicalTrialCard({
  id,
  title,
  status,
  phase,
  summary,
  countries = [],
  source = "clinicaltrials.gov",
  url,
  variant = "carousel",
}: Props) {
  const { theme } = useTheme();
  const isRecruiting = status.toLowerCase().includes("recruiting");

  const handlePress = () => {
    const link = url ?? `https://clinicaltrials.gov/study/${id}`;
    Linking.openURL(link);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.cardBase,
        { backgroundColor: theme.backgroundDefault },
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
          style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
        >
          {summary}
        </ThemedText>
      ) : null}

      {/* META ROW */}
      <View style={styles.metaRow}>
        {/* STATUS */}
        <View
          style={[
            styles.badge,
            isRecruiting
              ? { backgroundColor: theme.success + "20" }
              : { backgroundColor: theme.backgroundTertiary },
          ]}
        >
          <ThemedText type="small">
            {status.replace(/_/g, " ")}
          </ThemedText>
        </View>

        {/* SOURCE */}
        <View style={[styles.badge, { backgroundColor: theme.primary + "20" }]}>
          <ThemedText type="small" style={{ color: theme.primary }}>
            {SOURCE_LABEL[source] ?? source}
          </ThemedText>
        </View>

        {phase ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {phase}
          </ThemedText>
        ) : null}

        {countries.length > 0 ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {countries.slice(0, 2).join(", ")}
            {countries.length > 2 ? ` +${countries.length - 2}` : ""}
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
  },

  cardCarousel: {
    width: 220,
  },

  cardGrid: {
    width: "100%",
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },

  carouselTitle: {
    fontSize: 14,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },

  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
