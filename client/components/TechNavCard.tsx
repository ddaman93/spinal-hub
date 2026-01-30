import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import { Image, ImageSource } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

type TechNavCardProps = {
  title: string;
  subtitle: string;
  image: string | ImageSource;
  onPress: () => void;
};

export function TechNavCard({
  title,
  subtitle,
  image,
  onPress,
}: TechNavCardProps) {
  const imageSource = typeof image === "string" ? { uri: image } : image;
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      <Image
        source={imageSource}
        style={[styles.image, { backgroundColor: theme.backgroundTertiary }]}
        contentFit="cover"
      />

      <View style={styles.content}>
        <ThemedText type="small">
          {title}
        </ThemedText>

        <ThemedText
          type="caption"
          numberOfLines={2}
          style={{ color: theme.textSecondary }}
        >
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 16,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 100,
  },

  content: {
    padding: Spacing.sm,
    gap: 4,
  },
});