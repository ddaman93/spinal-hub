import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function ProfileSection({ title, children }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title.toUpperCase()}
      </ThemedText>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundDefault,
            shadowColor: theme.text,
            borderColor: theme.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.large,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
