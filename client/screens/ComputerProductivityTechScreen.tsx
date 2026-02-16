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

import type { ComputerProductivityProduct } from "@/data/computerProductivityProducts";
import {
  ALTERNATIVE_INPUT,
  ON_SCREEN_KEYBOARDS,
  VOICE_DICTATION,
  POINTER_CURSOR_TOOLS,
  REMOTE_BRIDGING,
} from "@/data/computerProductivityProducts";

/* ───────────────────────── screen ───────────────────────── */

export default function ComputerProductivityTechScreen() {
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
            Computer & Productivity Tech
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Hands-free computing solutions including head tracking, eye-gaze,
            voice control, and alternative input devices for computer access.
          </ThemedText>
        </View>

        <Section
          title="Alternative Input Devices"
          data={ALTERNATIVE_INPUT}
        />

        <Section
          title="On-Screen Keyboards & Text Entry"
          data={ON_SCREEN_KEYBOARDS}
        />

        <Section
          title="Voice Control & Dictation"
          data={VOICE_DICTATION}
        />

        <Section
          title="Pointer & Cursor Tools"
          data={POINTER_CURSOR_TOOLS}
        />

        <Section
          title="Remote Access & Device Bridging"
          data={REMOTE_BRIDGING}
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
  data: ComputerProductivityProduct[];
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
