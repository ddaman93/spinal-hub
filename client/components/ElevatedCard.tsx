import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ElevatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

// Design system "B" style — solid dark bg + green glow border
export function ElevatedCard({ children, style, padding = Spacing.md }: ElevatedCardProps) {
  const { isDark, theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
          shadowColor: isDark ? "#00E676" : "#000",
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
    overflow: "hidden",
  },
});
