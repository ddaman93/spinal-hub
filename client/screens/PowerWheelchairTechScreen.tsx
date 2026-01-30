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

import type { PowerWheelchairProduct } from "@/data/powerWheelchairProducts";
import {
  POWER_WHEELCHAIR_ACCESSORIES,
  SEATING_AND_POSITIONING,
  CONTROL_INTERFACES,
  ENVIRONMENTAL_ACCESS,
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
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.screenTitle}>
            Power Wheelchair Assistive Tech
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Accessories, controls, and seating systems that improve comfort,
            independence, and daily usability.
          </ThemedText>
        </View>

        <Section
          title="Power & Mobility Accessories"
          data={POWER_WHEELCHAIR_ACCESSORIES}
        />

        <Section
          title="Seating & Positioning"
          data={SEATING_AND_POSITIONING}
        />

        <Section
          title="Control Interfaces"
          data={CONTROL_INTERFACES}
        />

        <Section
          title="Environmental Access"
          data={ENVIRONMENTAL_ACCESS}
        />
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── section helper ───────────────────────── */

function Section({
  title,
  data,
}: {
  title: string;
  data: PowerWheelchairProduct[];
}) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.section}>
      <ThemedText
        type="heading"
        style={styles.sectionTitle}
      >
        {title}
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: Spacing.sm,
          paddingTop: Spacing.xs,
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
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 26,
  },
  subtitle: {
    opacity: 0.7,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
});
