import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
};

export function ProfileItem({ icon, label, value, onPress, isLast = false }: Props) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name={icon} size={17} color={theme.primary} />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
        <ThemedText type="body" style={styles.value} numberOfLines={1}>
          {value}
        </ThemedText>
      </View>
      {onPress && (
        <Feather name="chevron-right" size={18} color={theme.textSecondary} style={styles.chevron} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    minHeight: 60,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.small,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
});
