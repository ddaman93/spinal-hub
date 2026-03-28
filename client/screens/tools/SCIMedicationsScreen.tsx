import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import {
  SCI_MEDICATIONS,
  SCI_MEDICATION_CATEGORIES,
  PHARMAC_LABELS,
  CATEGORY_COLORS,
  type SciMedication,
} from "@/data/sciMedications";

/* ───────────────────────── helpers ───────────────────────── */

function pharmacBadgeStyle(label: string, theme: { success: string; warning: string; backgroundSecondary: string; textSecondary: string }) {
  switch (label) {
    case "Funded":
      return { bg: theme.success + "22", text: theme.success };
    case "Special Authority":
      return { bg: theme.warning + "22", text: theme.warning };
    default:
      return { bg: theme.backgroundSecondary, text: theme.textSecondary };
  }
}

/* ───────────────────────── screen ───────────────────────── */

export default function SCIMedicationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPharmac, setSelectedPharmac] = useState<string>("All");

  const filtered = useMemo(() => {
    return SCI_MEDICATIONS.filter((med) => {
      if (selectedCategory !== "All" && med.category !== selectedCategory) return false;
      if (selectedPharmac !== "All" && med.pharmacStatus.label !== selectedPharmac) return false;
      return true;
    });
  }, [selectedCategory, selectedPharmac]);

  /* ─── chip row ─── */
  const renderChipRow = (
    options: readonly string[],
    selected: string,
    onSelect: (v: string) => void,
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScroll}
    >
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.primary : theme.backgroundSecondary },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={option}
            accessibilityState={{ selected: active }}
          >
            <ThemedText
              type="small"
              style={{ color: active ? theme.buttonText : theme.text, fontWeight: "600" }}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  /* ─── row card ─── */
  const renderRow = ({ item }: { item: SciMedication }) => {
    const catColor = CATEGORY_COLORS[item.category] ?? "#6B7280";
    const pharmac = pharmacBadgeStyle(item.pharmacStatus.label, theme);

    return (
      <View style={[styles.rowCard, { backgroundColor: theme.backgroundDefault }]}>
        {/* left column */}
        <View style={styles.rowLeft}>
          <ThemedText type="small" style={{ fontWeight: "700" }}>
            {item.name}
          </ThemedText>
          <ThemedText
            type="caption"
            numberOfLines={1}
            style={{ color: theme.textSecondary }}
          >
            {item.usedFor.join(", ")}
          </ThemedText>
          <View style={[styles.categoryTag, { backgroundColor: catColor }]}>
            <ThemedText style={[styles.categoryTagText, { color: "#FFFFFF" }]}>
              {item.category}
            </ThemedText>
          </View>
        </View>

        {/* right column */}
        <View style={styles.rowRight}>
          <ThemedText
            type="caption"
            numberOfLines={1}
            style={{ color: theme.textSecondary }}
          >
            {item.shortSideEffects}
          </ThemedText>
          <View style={[styles.pharmacBadge, { backgroundColor: pharmac.bg }]}>
            <ThemedText type="caption" style={{ color: pharmac.text, fontWeight: "600" }}>
              {item.pharmacStatus.label}
            </ThemedText>
          </View>
          <Pressable
            onPress={() =>
              navigation.navigate("SCIMedicationDetail", {
                medicationId: item.id,
                name: item.name,
              })
            }
            style={[styles.viewButton, { backgroundColor: theme.primary }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`View details for ${item.name}`}
          >
            <ThemedText type="small" style={{ color: theme.buttonText, fontWeight: "600" }}>
              View →
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  /* ─── render ─── */
  return (
    <ThemedView style={styles.container}>
      {/* fixed header + filters */}
      <View style={[styles.headerBlock, { paddingTop: Spacing.lg }]}>
        <ThemedText type="heading">SCI Medications</ThemedText>
        <ThemedText type="small" style={[styles.disclaimer, { color: theme.textSecondary }]}>
          Reference guide only. These medications manage secondary effects of SCI — they do not
          treat the injury itself. PHARMAC status may change; check with your pharmacy or GP.
        </ThemedText>

        <ThemedText type="small" style={[styles.filterLabel, { color: theme.textSecondary }]}>
          Category
        </ThemedText>
        {renderChipRow(["All", ...SCI_MEDICATION_CATEGORIES], selectedCategory, setSelectedCategory)}

        <ThemedText type="small" style={[styles.filterLabel, { color: theme.textSecondary }]}>
          PHARMAC Status
        </ThemedText>
        {renderChipRow(["All", ...PHARMAC_LABELS], selectedPharmac, setSelectedPharmac)}
      </View>

      {/* scrollable medication list */}
      <FlatList
        data={filtered}
        renderItem={renderRow}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ textAlign: "center" }}>
              No medications match your filters.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerBlock: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  disclaimer: {
    marginTop: Spacing.sm,
    lineHeight: 20,
    opacity: 0.8,
  },

  filterLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },

  chipScroll: {
    // horizontal ScrollView — no extra style needed
  },

  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    minHeight: 44,
    justifyContent: "center",
  },

  list: { flex: 1 },

  /* ─── row card ─── */
  rowCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    gap: Spacing.sm,
  },

  rowLeft: {
    flex: 1,
    gap: 4,
    justifyContent: "space-between",
  },

  rowRight: {
    width: 130,
    alignItems: "flex-end",
    gap: 4,
    justifyContent: "space-between",
  },

  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  categoryTagText: {
    fontSize: 11,
    fontWeight: "600",
  },

  pharmacBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },

  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.small,
    minWidth: 76,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    paddingTop: Spacing.xxl,
    alignItems: "center",
  },
});
