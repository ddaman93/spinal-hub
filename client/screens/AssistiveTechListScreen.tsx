import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { Spacing } from "@/constants/theme";
import { filterAssistiveTech } from "@/utils/filterAssistiveTech";

/* ───────────────────────── helpers ───────────────────────── */

// derive available filter options from data (static)
const ALL_CATEGORIES = Array.from(
  new Set(ASSISTIVE_TECH_ITEMS.map((i) => i.category))
);

const ALL_TAGS = Array.from(
  new Set(ASSISTIVE_TECH_ITEMS.flatMap((i) => i.tags))
);

/* ───────────────────────── screen ───────────────────────── */

export default function AssistiveTechListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const safeHeaderHeight =
    headerHeight > 0 ? headerHeight : Spacing.xl;

  /* ───── filter state ───── */
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);
  const [selectedTags, setSelectedTags] =
    useState<string[]>([]);

  /* ───── filtering logic (shared helper) ───── */
  const filteredItems = useMemo(() => {
    return filterAssistiveTech(
      ASSISTIVE_TECH_ITEMS,
      {
        category: selectedCategory,
        tags: selectedTags,
      }
    );
  }, [selectedCategory, selectedTags]);

  /* ───── tag toggle ───── */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: safeHeaderHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* CATEGORY FILTERS */}
        <View style={styles.filterRow}>
          {ALL_CATEGORIES.map((category) => {
            const active =
              selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setSelectedCategory(
                    active ? null : category
                  )
                }
                style={[
                  styles.filterChip,
                  active &&
                    styles.filterChipActive,
                ]}
              >
                <ThemedText type="caption">
                  {category.replace("-", " ")}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* TAG FILTERS */}
        <View style={styles.filterRow}>
          {ALL_TAGS.map((tag) => {
            const active =
              selectedTags.includes(tag);

            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.filterChip,
                  active &&
                    styles.filterChipActive,
                ]}
              >
                <ThemedText type="caption">
                  {tag.replace("-", " ")}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* GRID */}
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <AssistiveTechCard
              key={item.id}
              item={item}
              variant="grid"
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },

  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  filterChipActive: {
    backgroundColor: "rgba(77,163,255,0.35)",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
    marginTop: Spacing.sm,
  },
});