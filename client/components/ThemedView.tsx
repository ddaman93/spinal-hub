import { View, StyleSheet, Dimensions, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";

const { width: W, height: H } = Dimensions.get("window");

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  children,
  ...otherProps
}: ThemedViewProps) {
  const { theme, isDark } = useTheme();

  // Root screen containers have no colour overrides — apply glass background in dark mode.
  // Nested panels/cards pass a darkColor override, so they stay solid.
  const isRootContainer = !darkColor && !lightColor;

  if (isDark && isRootContainer) {
    return (
      <View style={[styles.root, style]} {...otherProps}>
        {/* Gradient background */}
        <LinearGradient
          colors={["#060E08", "#0A1A0C", "#060E08"]}
          style={StyleSheet.absoluteFill}
        />
        {/* Ambient green orbs */}
        <View style={styles.orb1} pointerEvents="none" />
        <View style={styles.orb2} pointerEvents="none" />
        {children}
      </View>
    );
  }

  const backgroundColor =
    isDark && darkColor ? darkColor
    : !isDark && lightColor ? lightColor
    : theme.backgroundRoot;

  return (
    <View style={[{ backgroundColor }, style]} {...otherProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  orb1: {
    position: "absolute",
    width: W * 0.85,
    height: W * 0.85,
    borderRadius: W * 0.425,
    backgroundColor: "rgba(0, 100, 40, 0.15)",
    top: -W * 0.3,
    right: -W * 0.3,
    pointerEvents: "none",
  } as any,
  orb2: {
    position: "absolute",
    width: W * 0.75,
    height: W * 0.75,
    borderRadius: W * 0.375,
    backgroundColor: "rgba(0, 80, 30, 0.11)",
    bottom: H * 0.1,
    left: -W * 0.3,
    pointerEvents: "none",
  } as any,
});
