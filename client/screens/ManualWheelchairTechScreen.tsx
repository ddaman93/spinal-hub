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

import type { ManualWheelchairProduct } from "@/data/manualWheelchairProducts";
import {
  POWER_ASSIST_WHEELS,
  HANDCYCLE_ATTACHMENTS,
  PROPULSION_AIDS,
  TRANSFER_AND_SETUP_AIDS,
} from "@/data/manualWheelchairProducts";

/* ───────────────────────── screen ───────────────────────── */

export default function ManualWheelchairTechScreen() {
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
            Manual Wheelchair Assistive Tech
          </ThemedText>
          <ThemedText type="small" style={{ opacity: 0.7 }}>
            Products designed to reduce effort, improve mobility,
            and protect shoulders.
          </ThemedText>
        </View>

        {/* POWER ASSIST */}
        <Section
          title="Power-Assist Wheels"
          data={POWER_ASSIST_WHEELS}
        />

        {/* HANDCYCLES */}
        <Section
          title="Handcycle & Trike Attachments"
          data={HANDCYCLE_ATTACHMENTS}
        />

        {/* PROPULSION */}
        <Section
          title="Push & Propulsion Aids"
          data={PROPULSION_AIDS}
        />

        {/* TRANSFER */}
        <Section
          title="Transfer & Setup Aids"
          data={TRANSFER_AND_SETUP_AIDS}
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
  data: ManualWheelchairProduct[];
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