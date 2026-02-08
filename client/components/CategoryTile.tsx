import React from "react";
import { StyleSheet, Pressable, ViewStyle, View } from "react-native";
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
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  /** When supplied, rendered in place of the Feather icon. */
  customIcon?: React.ReactNode;
  /** Colour of the 3 px accent bar along the bottom edge. */
  accentColor?: string;
  /** Background colour of the icon container (e.g. a faint brand tint). */
  iconBg?: string;
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
  icon,
  onPress,
  style,
  customIcon,
  accentColor,
  iconBg,
}: CategoryTileProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
    opacity.value = withSpring(0.8, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tile,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
        style,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={`Opens ${title}`}
    >
      <View
        style={[
          styles.iconContainer,
          iconBg && { backgroundColor: iconBg },
        ]}
      >
        {customIcon ?? (
          <Feather name={icon} size={24} color={theme.primary} />
        )}
      </View>
      <ThemedText type="small" style={styles.label} numberOfLines={2}>
        {title}
      </ThemedText>

      {/* Brand accent bar – only rendered when accentColor is provided */}
      {accentColor && (
        <View
          style={[styles.accentBar, { backgroundColor: accentColor }]}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.small,
    padding: 4,
  },
  accentBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: BorderRadius.medium,
    borderBottomRightRadius: BorderRadius.medium,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
  },
});
