import React from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { ArticleCategory } from "@/services/newsService";

function timeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Breakthrough: "#FF6B35",
  "Clinical Trial": "#4ECDC4",
  Rehab: "#45B7D1",
  Research: "#96CEB4",
  General: "#888888",
};

type Props = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: ArticleCategory;
  imageUrl?: string;
  variant?: "carousel" | "grid";
};

export function SciNewsCard({
  title,
  url,
  source,
  publishedAt,
  category,
  variant = "carousel",
}: Props) {
  const { theme } = useTheme();
  const badgeColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.General;

  return (
    <Pressable
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
      style={({ pressed }) => [
        styles.cardBase,
        { backgroundColor: theme.backgroundDefault },
        variant === "carousel" ? styles.cardCarousel : styles.cardGrid,
        pressed && { opacity: 0.7 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.cardContent}>
        {/* CATEGORY BADGE */}
        <View style={[styles.badge, { backgroundColor: badgeColor + "22" }]}>
          <ThemedText style={[styles.badgeText, { color: badgeColor }]}>
            {category}
          </ThemedText>
        </View>

        <ThemedText
          type="small"
          numberOfLines={variant === "carousel" ? 3 : 2}
          style={[styles.title, variant === "carousel" && styles.carouselTitle]}
        >
          {title}
        </ThemedText>

        {/* META ROW */}
        <View style={styles.metaRow}>
          {source ? (
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {source}
            </ThemedText>
          ) : null}
          {publishedAt ? (
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {timeAgo(publishedAt)}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },

  cardCarousel: {
    width: 300,
  },

  cardGrid: {
    width: "100%",
  },

  cardContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 2,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },

  carouselTitle: {
    fontSize: 14,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 2,
  },
});
