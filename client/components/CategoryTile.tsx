import React from "react";
import { StyleSheet, Pressable, ViewStyle, View, ImageBackground } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CategoryTileProps {
  title: string;
  description?: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  /** When supplied, rendered in place of the Feather icon. */
  customIcon?: React.ReactNode;
  /** Accent colour — drives the icon background tint. */
  accentColor?: string;
  /** Override icon background colour. Falls back to accentColor + 18% opacity. */
  iconBg?: string;
  /** When supplied, renders as the tile background image with a dark overlay. */
  imageUri?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryTile({
  title,
  description,
  icon,
  onPress,
  style,
  customIcon,
  accentColor = "#007AFF",
  iconBg,
  imageUri,
}: CategoryTileProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  // Derive icon bg from accent colour if not explicitly provided
  const resolvedIconBg = iconBg ?? accentColor + "22";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tile,
        {
          backgroundColor: imageUri ? "transparent" : theme.backgroundDefault,
          shadowColor: theme.text,
        },
        animatedStyle,
        style,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={`Opens ${title}`}
    >
      {/* Image background with dark overlay */}
      {imageUri && (
        <ImageBackground
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="contain"
        >
          <View style={styles.imageOverlay} />
        </ImageBackground>
      )}

      {/* Coloured top edge */}
      <View style={[styles.topEdge, { backgroundColor: accentColor }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: imageUri ? "rgba(255,255,255,0.18)" : resolvedIconBg }]}>
        {customIcon ?? (
          <Feather name={icon} size={20} color={imageUri ? "#FFFFFF" : accentColor} />
        )}
      </View>

      {/* Text */}
      <ThemedText style={[styles.title, imageUri && { color: "#FFFFFF" }]} numberOfLines={2}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText
          style={[styles.description, { color: imageUri ? "rgba(255,255,255,0.8)" : theme.textSecondary }]}
          numberOfLines={2}
        >
          {description}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: BorderRadius.large,
    paddingHorizontal: Spacing.sm,
    paddingTop: 0,
    paddingBottom: Spacing.md,
    overflow: "hidden",
    gap: 6,
    // shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  topEdge: {
    height: 3,
    marginHorizontal: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 10,
    lineHeight: 13,
  },
});
