import React from "react";
import { Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { useHeaderScroll } from "@/context/HeaderScrollContext";

/**
 * Transparent at scroll=0, fades to the green gradient (dark) or white (light)
 * as the user scrolls down. Defined at module level so React Navigation never
 * recreates the component type across renders.
 */
export function AnimatedHeaderBackground() {
  const { isDark } = useTheme();
  const { scrollY } = useHeaderScroll();

  const opacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (isDark) {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <LinearGradient
          colors={["#0C1A0E", "#060E08"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "#FFFFFF",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: "rgba(0,0,0,0.1)",
          opacity,
        },
      ]}
    />
  );
}
