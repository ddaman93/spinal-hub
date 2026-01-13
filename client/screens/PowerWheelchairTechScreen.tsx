import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProductCard } from "@/components/ProductCard";
import { Spacing } from "@/constants/theme";

import {
  POWER_WHEELCHAIR_ACCESSORIES,
  SEATING_AND_POSITIONING,
  CONTROL_INTERFACES,
} from "@/data/powerWheelchairProducts";

/* ───────────────────────── screen ───────────────────────── */

export default function PowerWheelchairTechScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading">
            Power Wheelchair Assistive Tech
          </ThemedText>

          <ThemedText
            type="small"
            style={{ opacity: 0.7 }}
          >
            Accessories, controls, and seating systems that improve comfort,
            independence, and daily usability for power wheelchair users.
          </ThemedText>
        </View>

        {/* POWER & MOBILITY */}
        <Section
          title="Power & Mobility Accessories"
          data={POWER_WHEELCHAIR_ACCESSORIES}
        />

        {/* SEATING */}
        <Section
          title="Seating & Positioning"
          data={SEATING_AND_POSITIONING}
        />

        {/* CONTROLS */}
        <Section
          title="Control Interfaces"
          data={CONTROL_INTERFACES}
        />
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── section helper ───────────────────────── */

type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
};

function Section({
  title,
  data,
}: {
  title: string;
  data: Product[];
}) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.section}>
      <ThemedText type="h3">
        {title}
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: Spacing.md,
          paddingTop: Spacing.sm,
        }}
      >
        {data.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </ScrollView>
    </View>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },

  section: {
    marginBottom: Spacing.xl,
  },
});