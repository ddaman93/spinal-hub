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
import { useRoute, RouteProp } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProductCard } from "@/components/ProductCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { WHEELCHAIR_GLOVES } from "@/data/manualWheelchairProducts";

type BrandScreenRoute = RouteProp<MainStackParamList, "WheelchairGloveBrand">;

const ACCENT = "#2563EB";

type Pill = { label: string; filterTag: string | null };

const PILLS: Pill[] = [
  { label: "All", filterTag: null },
  { label: "Traction", filterTag: "filter:traction" },
  { label: "Palm Protection", filterTag: "filter:palm-protection" },
  { label: "Wrist Support", filterTag: "filter:wrist-support" },
  { label: "Easy On/Off", filterTag: "filter:easy-on-off" },
  { label: "Pain/Circulation", filterTag: "filter:pain-circulation" },
];

export default function WheelchairGloveBrandScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const { theme } = useTheme();
  const route = useRoute<BrandScreenRoute>();
  const { brandId } = route.params;

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const brandProducts = WHEELCHAIR_GLOVES.filter((p) =>
    p.tags.includes(`brand:${brandId}`)
  );

  const filteredProducts =
    activeFilter === null
      ? brandProducts
      : brandProducts.filter((p) => p.tags.includes(activeFilter));

  const handlePillPress = (filterTag: string | null) => {
    setActiveFilter(filterTag === activeFilter ? null : filterTag);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* PILL FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm }}
        >
          {PILLS.map((pill) => {
            const isActive =
              pill.filterTag === activeFilter ||
              (pill.filterTag === null && activeFilter === null);
            return (
              <Pressable
                key={pill.label}
                onPress={() => handlePillPress(pill.filterTag)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive
                      ? ACCENT
                      : theme.backgroundDefault,
                    borderColor: ACCENT,
                  },
                ]}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${pill.label}`}
              >
                <ThemedText
                  type="small"
                  style={[
                    styles.pillText,
                    { color: isActive ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {pill.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact={true} />
            ))}
          </View>
        ) : (
          <ThemedText
            type="body"
            style={[styles.empty, { color: theme.textSecondary }]}
          >
            No products found for this filter.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  empty: {
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },
});
