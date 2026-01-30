import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";

const TOUCH_TARGET_SIZE = 48;
const ICON_SIZE = 24;

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ThemeSwitchButton(): React.JSX.Element {
  const { theme, isDark, toggleTheme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, springConfig);
  };

  const iconName = isDark ? "sun" : "moon";
  const accessibilityLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <AnimatedPressable
      onPress={toggleTheme}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to change the app's color theme"
    >
      <Feather name={iconName} size={ICON_SIZE} color={theme.text} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
