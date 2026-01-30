import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { AssistiveTechItem } from "@/data/assistiveTech";

const TAG_COLORS: Record<string, string> = {
  mobility: "#FACC15",
  "manual-wheelchair": "#F59E0B",
  "power-wheelchair": "#EF4444",
  "computer-access": "#22C55E",
  "smart-home": "#06B6D4",
  voice: "#3B82F6",
  communication: "#8B5CF6",
  "eye-tracking": "#EC4899",
  accessibility: "#10B981",
};

type Props = {
  item: AssistiveTechItem;
  variant?: "carousel" | "grid";
};

export function AssistiveTechCard({
  item,
  variant = "grid",
}: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() =>
        navigation.navigate(
          "AssistiveTechDetail",
          { itemId: item.id }
        )
      }
      style={[
        styles.card,
        variant === "carousel" && styles.carouselCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      {item.heroImageUrl && (
        <Image
          source={{ uri: item.heroImageUrl }}
          style={[styles.image, { backgroundColor: theme.backgroundTertiary }]}
          contentFit="cover"
        />
      )}

      <View style={styles.content}>
        {/* TAGS */}
        <View style={styles.tagRow}>
          {item.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                {
                  backgroundColor:
                    TAG_COLORS[tag] ??
                    "#6B7280",
                },
              ]}
            >
              <ThemedText style={[styles.tagText, { color: theme.buttonText }]}>
                {tag.replace("-", " ")}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* TITLE */}
        <ThemedText
          type="small"
          numberOfLines={2}
          style={{ fontWeight: "600" }}
        >
          {item.title}
        </ThemedText>

        {/* SUMMARY */}
        <ThemedText
          type="caption"
          numberOfLines={2}
          style={{ color: theme.textSecondary }}
        >
          {item.summary}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  carouselCard: {
    width: 160,
    height: 160,
    flex: undefined,
  },

  image: {
    width: "100%",
    height: 60,
  },

  content: {
    flex: 1,
    padding: Spacing.sm,
    gap: 3,
    justifyContent: "space-between",
  },

  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },

  tagText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});