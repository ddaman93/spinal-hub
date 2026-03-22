import React, { useState } from "react";
import { View, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  isLast?: boolean;
};

export function DropdownPicker({ label, value, options, onChange, isLast }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.fieldRow,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
          pressed && { opacity: 0.6 },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || "Select"}`}
      >
        <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
        <View style={styles.row}>
          <ThemedText
            type="body"
            style={[styles.valueText, { color: value ? theme.text : theme.textSecondary }]}
            numberOfLines={1}
          >
            {value || "Select…"}
          </ThemedText>
          <Feather name="chevron-down" size={18} color={theme.textSecondary} />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.backgroundDefault, paddingBottom: insets.bottom + Spacing.md },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <ThemedText type="h4" style={styles.sheetTitle}>
            {label}
          </ThemedText>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, i) => (
              <Pressable
                key={option}
                onPress={() => { onChange(option); setOpen(false); }}
                style={({ pressed }) => [
                  styles.option,
                  i < options.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                  pressed && { opacity: 0.6 },
                ]}
                accessible
                accessibilityRole="menuitem"
                accessibilityLabel={option}
              >
                <ThemedText
                  type="body"
                  style={[
                    styles.optionText,
                    value === option && { color: theme.primary, fontWeight: "600" },
                  ]}
                >
                  {option}
                </ThemedText>
                {value === option && <Feather name="check" size={18} color={theme.primary} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontWeight: "500",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    fontSize: 16,
    flex: 1,
    marginRight: Spacing.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 17,
  },
});
