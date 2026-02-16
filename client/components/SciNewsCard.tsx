import React from "react";
import { View, StyleSheet, Pressable, Linking, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  variant?: "carousel" | "grid";
};

export function SciNewsCard({
  title,
  url,
  source,
  publishedAt,
  imageUrl,
  variant = "carousel",
}: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => {
        if (url) {
          Linking.openURL(url);
        }
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
      {/* IMAGE */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.cardImage,
            { backgroundColor: theme.backgroundTertiary },
          ]}
        />
      )}

      {/* CONTENT */}
      <View style={styles.cardContent}>
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

        {/* META ROW */}
        <View style={styles.metaRow}>
          {source && (
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {source}
            </ThemedText>
          )}
          {publishedAt && (
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {new Date(publishedAt).toLocaleDateString()}
            </ThemedText>
          )}
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

  // Dashboard horizontal carousel: fixed width
  cardCarousel: {
    width: 300,
  },

  // Grid/list: must fill container width
  cardGrid: {
    width: "100%",
  },

  cardImage: {
    width: "100%",
    height: 140,
  },

  cardContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
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
  },
});
