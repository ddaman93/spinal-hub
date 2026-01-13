import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";

type TechNavCardProps = {
  title: string;
  subtitle: string;
  image: string;
  onPress: () => void;
};

export function TechNavCard({
  title,
  subtitle,
  image,
  onPress,
}: TechNavCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.content}>
        <ThemedText type="small">
          {title}
        </ThemedText>

        <ThemedText
          type="caption"
          style={{ opacity: 0.7 }}
          numberOfLines={2}
        >
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#000",
  },

  content: {
    padding: Spacing.md,
    gap: 6,
  },
});