import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
};

export function OnboardingInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          multiline && styles.multiline,
        ]}
        accessible
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 17,
    minHeight: 52,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
});
