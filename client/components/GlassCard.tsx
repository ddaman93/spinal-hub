import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function GlassCard({ children, style, padding = Spacing.md }: GlassCardProps) {
  const { isDark, theme } = useTheme();
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={isDark ? 18 : 40}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      >
        <View
          style={[
            styles.inner,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              padding,
            },
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.large,
    overflow: "hidden",
  },
  blur: {
    borderRadius: BorderRadius.large,
  },
  inner: {
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    overflow: "hidden",
  },
});
