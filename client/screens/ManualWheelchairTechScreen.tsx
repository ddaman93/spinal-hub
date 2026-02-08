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
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.screenTitle}>
            Manual Wheelchair Assistive Tech
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Products designed to reduce effort, improve mobility,
            and protect shoulders.
          </ThemedText>
        </View>

        <Section
          title="Power-Assist Wheels"
          data={POWER_ASSIST_WHEELS}
        />

        <Section
          title="Handcycle & Trike Attachments"
          data={HANDCYCLE_ATTACHMENTS}
        />

        <Section
          title="Push & Propulsion Aids"
          data={PROPULSION_AIDS}
        />

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
            compact={true}
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