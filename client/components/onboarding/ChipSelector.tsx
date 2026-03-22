import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function ChipSelector({ label, options, selected, onChange }: Props) {
  const { theme } = useTheme();

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <View style={styles.chips}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => toggle(opt)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? theme.primary : theme.backgroundSecondary,
                  borderColor: active ? theme.primary : theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={opt}
            >
              {active && (
                <Feather name="check" size={13} color="#fff" style={styles.checkIcon} />
              )}
              <ThemedText
                type="small"
                style={[
                  styles.chipText,
                  { color: active ? "#fff" : theme.text },
                ]}
              >
                {opt}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: 5,
  },
  chipText: {
    fontWeight: "500",
    fontSize: 14,
  },
});
