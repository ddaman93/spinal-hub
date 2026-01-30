import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
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
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryTile({ title, icon, onPress, style }: CategoryTileProps) {
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
      <Feather
        name={icon}
        size={24}
        color={theme.primary}
        style={styles.icon}
      />
      <ThemedText type="small" style={styles.label} numberOfLines={2}>
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
  },
});
