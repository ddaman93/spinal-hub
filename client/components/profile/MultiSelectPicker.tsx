import React, { useState } from "react";
import { View, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Props {
  label: string;
  value: string; // comma-separated selected items
  options: string[];
  onChange: (v: string) => void;
  isLast?: boolean;
}

export function MultiSelectPicker({ label, value, options, onChange, isLast }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string[]>([]);

  const selected = value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  function openModal() {
    setPending(
      value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
    );
    setOpen(true);
  }

  function toggle(item: string) {
    setPending((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function confirm() {
    onChange(pending.join(", "));
    setOpen(false);
  }

  const displayValue = selected.length > 0 ? selected.join(", ") : "";

  return (
    <>
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [
          styles.fieldRow,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
          pressed && { opacity: 0.6 },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayValue || "None selected"}`}
      >
        <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
        <View style={styles.row}>
          <ThemedText
            type="body"
            numberOfLines={2}
            style={[styles.valueText, { color: displayValue ? theme.text : theme.textSecondary }]}
          >
            {displayValue || "Select…"}
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
          <View style={styles.sheetHeader}>
            <ThemedText type="h4">{label}</ThemedText>
            {pending.length > 0 && (
              <Pressable
                onPress={() => setPending([])}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Clear all</ThemedText>
              </Pressable>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            {options.map((option, i) => {
              const checked = pending.includes(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => toggle(option)}
                  style={({ pressed }) => [
                    styles.option,
                    i < options.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.border,
                    },
                    pressed && { opacity: 0.6 },
                  ]}
                  accessible
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={option}
                >
                  <ThemedText
                    type="body"
                    style={[
                      styles.optionText,
                      checked && { color: theme.primary, fontWeight: "600" },
                    ]}
                  >
                    {option}
                  </ThemedText>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: checked ? theme.primary : "transparent",
                        borderColor: checked ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    {checked && <Feather name="check" size={13} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={confirm}
            style={({ pressed }) => [
              styles.doneBtn,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText type="body" style={{ color: "#fff", fontWeight: "700" }}>
              {pending.length > 0 ? `Done (${pending.length} selected)` : "Done"}
            </ThemedText>
          </Pressable>
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
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flex: 1,
    marginRight: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    height: 52,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
});
