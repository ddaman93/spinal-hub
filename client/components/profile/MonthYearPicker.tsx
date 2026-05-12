import React, { useState } from "react";
import { View, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildYears(): string[] {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let y = current; y >= 1970; y--) years.push(String(y));
  return years;
}

const YEARS = buildYears();

function parseValue(val: string): { month: string; year: string } {
  const parts = val.trim().split(" ");
  if (parts.length === 2 && MONTHS.includes(parts[0]) && /^\d{4}$/.test(parts[1])) {
    return { month: parts[0], year: parts[1] };
  }
  return { month: "", year: "" };
}

interface Props {
  label: string;
  value: string; // "March 2019" or ""
  onChange: (v: string) => void;
  isLast?: boolean;
}

export function MonthYearPicker({ label, value, onChange, isLast }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const parsed = parseValue(value);
  const [pendingMonth, setPendingMonth] = useState(parsed.month);
  const [pendingYear, setPendingYear] = useState(parsed.year);

  function openModal() {
    const p = parseValue(value);
    setPendingMonth(p.month);
    setPendingYear(p.year);
    setOpen(true);
  }

  function confirm() {
    if (pendingMonth && pendingYear) {
      onChange(`${pendingMonth} ${pendingYear}`);
    } else if (pendingMonth || pendingYear) {
      onChange(`${pendingMonth || ""} ${pendingYear || ""}`.trim());
    }
    setOpen(false);
  }

  function clear() {
    setPendingMonth("");
    setPendingYear("");
    onChange("");
    setOpen(false);
  }

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
          <ThemedText type="h4" style={styles.sheetTitle}>{label}</ThemedText>

          {/* Two columns side by side */}
          <View style={styles.columns}>
            {/* Month column */}
            <View style={styles.col}>
              <ThemedText type="caption" style={[styles.colHeader, { color: theme.textSecondary }]}>
                MONTH
              </ThemedText>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.colScroll}>
                {MONTHS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setPendingMonth(m)}
                    style={({ pressed }) => [
                      styles.option,
                      { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        pendingMonth === m && { color: theme.primary, fontWeight: "700" },
                        { color: pendingMonth === m ? theme.primary : theme.text },
                      ]}
                    >
                      {m}
                    </ThemedText>
                    {pendingMonth === m && (
                      <Feather name="check" size={16} color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Divider */}
            <View style={[styles.colDivider, { backgroundColor: theme.border }]} />

            {/* Year column */}
            <View style={styles.col}>
              <ThemedText type="caption" style={[styles.colHeader, { color: theme.textSecondary }]}>
                YEAR
              </ThemedText>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.colScroll}>
                {YEARS.map((y) => (
                  <Pressable
                    key={y}
                    onPress={() => setPendingYear(y)}
                    style={({ pressed }) => [
                      styles.option,
                      { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        { color: pendingYear === y ? theme.primary : theme.text },
                        pendingYear === y && { fontWeight: "700" },
                      ]}
                    >
                      {y}
                    </ThemedText>
                    {pendingYear === y && (
                      <Feather name="check" size={16} color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Action row */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={clear}
              style={({ pressed }) => [styles.clearBtn, { borderColor: theme.border, opacity: pressed ? 0.5 : 1 }]}
            >
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Clear</ThemedText>
            </Pressable>
            <Pressable
              onPress={confirm}
              style={({ pressed }) => [styles.doneBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
            >
              <ThemedText type="small" style={{ color: "#fff", fontWeight: "700" }}>Done</ThemedText>
            </Pressable>
          </View>
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
    maxHeight: "72%",
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
  columns: {
    flexDirection: "row",
    flex: 1,
    minHeight: 260,
    maxHeight: 300,
  },
  col: {
    flex: 1,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  colScroll: {
    flex: 1,
  },
  colDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.xs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: Spacing.xs,
  },
  optionText: {
    fontSize: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  clearBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
});
