import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { RouteProp, useRoute } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProductCard } from "@/components/ProductCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import {
  ALTERNATIVE_MICE_SUBCATEGORIES,
  ALTERNATIVE_MICE,
  AlternativeMiceSubcategory,
} from "@/data/computerProductivityProducts";

type AlternativeMiceProductsScreenRouteProp = RouteProp<
  MainStackParamList,
  "AlternativeMiceProducts"
>;

/* ───────────────────────── screen ───────────────────────── */

export default function AlternativeMiceProductsScreen() {
  const route = useRoute<AlternativeMiceProductsScreenRouteProp>();
  const { initialSubcategory } = route.params;

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<AlternativeMiceSubcategory>(
      initialSubcategory || ALTERNATIVE_MICE_SUBCATEGORIES[0].id
    );

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();

  // Filter products by selected subcategory
  const filteredProducts = ALTERNATIVE_MICE.filter(
    (product) =>
      product.category === "alternative-mice" &&
      product.subcategory === selectedSubcategory
  );

  const selectedSubcategoryData = ALTERNATIVE_MICE_SUBCATEGORIES.find(
    (sub) => sub.id === selectedSubcategory
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.screenTitle}>
            {selectedSubcategoryData?.title || "Alternative Mice"}
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            {selectedSubcategoryData?.description || ""}
          </ThemedText>
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {ALTERNATIVE_MICE_SUBCATEGORIES.map((subcategory) => (
            <FilterChip
              key={subcategory.id}
              label={subcategory.title}
              selected={selectedSubcategory === subcategory.id}
              onPress={() => setSelectedSubcategory(subcategory.id)}
            />
          ))}
        </ScrollView>

        {/* PRODUCTS */}
        {filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact={true} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText type="small" style={{ opacity: 0.6 }}>
              No products available in this category yet.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── filter chip ───────────────────────── */

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.primary
            : theme.backgroundDefault,
          borderWidth: selected ? 0 : 1,
          borderColor: theme.border,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={{
          color: selected ? "#fff" : theme.text,
          fontWeight: selected ? "600" : "400",
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },

  screenTitle: {
    fontSize: 22,
    lineHeight: 26,
  },

  subtitle: {
    opacity: 0.7,
  },

  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },

  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },

  productsGrid: {
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  emptyState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
});
