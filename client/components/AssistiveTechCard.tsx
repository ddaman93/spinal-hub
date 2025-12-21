import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";

import { Spacing } from "@/constants/theme";
import type { AssistiveTechItem } from "@/data/assistiveTech";
import { ThemedText } from "@/components/ThemedText";

type Props = {
  item: AssistiveTechItem;
  onPress?: () => void;
};

export function AssistiveTechCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.content}>
        <ThemedText type="heading" numberOfLines={2}>
          {item.title}
        </ThemedText>

        <ThemedText
          type="small"
          numberOfLines={2}
          style={{ opacity: 0.85 }}
        >
          {item.summary}
        </ThemedText>
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
  image: {
    height: 140,
    width: "100%",
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  imageContainer: {
    position: "relative",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});