import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import type { AssistiveTechItem } from "@/data/assistiveTech";
import { useBookmarks } from "@/hooks/useBookmarks";

type Props = {
  item: AssistiveTechItem;
  onPress?: () => void;
};

export function AssistiveTechCard({ item, onPress }: Props) {
  const { toggle, isSaved } = useBookmarks();
  const saved = isSaved("assistiveTech", item.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9 },
      ]}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Save Button */}
        <Pressable
          onPress={() => toggle("assistiveTech", item.id)}
          style={styles.saveButton}
          hitSlop={10}
        >
          <Feather
            name="bookmark"
            size={18}
            color={saved ? "#4DA3FF" : "rgba(255,255,255,0.85)"}
          />
        </Pressable>
      </View>

      {/* Text */}
      <View style={styles.content}>
        <ThemedText type="heading" numberOfLines={2}>
          {item.title}
        </ThemedText>

        <ThemedText type="small" numberOfLines={2} style={{ opacity: 0.85 }}>
          {item.summary}
        </ThemedText>

        <View style={styles.tags}>
          {item.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <ThemedText type="caption">
                {tag.replace("-", " ")}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    height: 140,
    width: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  saveButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  tags: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});