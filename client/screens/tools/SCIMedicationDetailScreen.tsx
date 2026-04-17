import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { SCI_MEDICATIONS, CATEGORY_COLORS } from "@/data/sciMedications";

type RouteProps = RouteProp<MainStackParamList, "SCIMedicationDetail">;

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

export default function SCIMedicationDetailScreen() {
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [lessCommonExpanded, setLessCommonExpanded] = useState(false);

  const medication = SCI_MEDICATIONS.find((m) => m.id === route.params.medicationId);

  if (!medication) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <ThemedText type="body">Medication not found.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const pharmac = pharmacBadgeStyle(medication.pharmacStatus.label, theme);
  const catColor = CATEGORY_COLORS[medication.category] ?? "#6B7280";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.lg,
        }}
      >
        {/* ─── name + badges ─── */}
        <View style={styles.titleBlock}>
          <ThemedText type="h3">{medication.name}</ThemedText>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryTag, { backgroundColor: catColor }]}>
              <ThemedText style={[styles.categoryTagText, { color: "#FFFFFF" }]}>
                {medication.category}
              </ThemedText>
            </View>
            <View style={[styles.pharmacBadge, { backgroundColor: pharmac.bg }]}>
              <ThemedText style={{ color: pharmac.text, fontWeight: "600", fontSize: 13 }}>
                {medication.pharmacStatus.label}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary, opacity: 0.8 }}>
            {medication.pharmacStatus.details}
          </ThemedText>
        </View>

        {/* ─── what it's used for ─── */}
        <View>
          <ThemedText type="h4" style={styles.sectionHeading}>
            What it's used for
          </ThemedText>
          {medication.usedFor.map((use, i) => (
            <View key={i} style={styles.bulletRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>•</ThemedText>
              <ThemedText type="small">{use}</ThemedText>
            </View>
          ))}
        </View>

        {/* ─── common side effects ─── */}
        <View>
          <ThemedText type="h4" style={styles.sectionHeading}>
            Common side effects
          </ThemedText>
          {medication.sideEffects.common.map((effect, i) => (
            <View key={i} style={styles.bulletRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>•</ThemedText>
              <ThemedText type="small">{effect}</ThemedText>
            </View>
          ))}
        </View>

        {/* ─── less common (collapsible) ─── */}
        {medication.sideEffects.lessCommon.length > 0 && (
          <View>
            <Pressable
              onPress={() => setLessCommonExpanded(!lessCommonExpanded)}
              style={styles.collapsibleHeader}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Less common side effects — ${lessCommonExpanded ? "expanded" : "collapsed"}`}
              accessibilityState={{ expanded: lessCommonExpanded }}
            >
              <ThemedText type="h4">Less common side effects</ThemedText>
              <Feather
                name={lessCommonExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
            {lessCommonExpanded &&
              medication.sideEffects.lessCommon.map((effect, i) => (
                <View key={i} style={styles.bulletRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>•</ThemedText>
                  <ThemedText type="small">{effect}</ThemedText>
                </View>
              ))}
          </View>
        )}

        {/* ─── serious — only if present ─── */}
        {medication.sideEffects.serious.length > 0 && (
          <View style={[styles.seriousBlock, { backgroundColor: theme.error + "12", borderColor: theme.error }]}>
            <View style={styles.seriousHeader}>
              <Feather name="alert-triangle" size={18} color={theme.error} />
              <ThemedText type="small" style={{ color: theme.error, fontWeight: "700" }}>
                Serious — seek help
              </ThemedText>
            </View>
            {medication.sideEffects.serious.map((effect, i) => (
              <ThemedText key={i} type="small" style={{ color: theme.error }}>
                {effect}
              </ThemedText>
            ))}
          </View>
        )}

        {/* ─── available forms ─── */}
        <View>
          <ThemedText type="h4" style={styles.sectionHeading}>
            Available forms
          </ThemedText>
          {medication.forms.map((form, i) => (
            <View key={i} style={styles.bulletRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>•</ThemedText>
              <ThemedText type="small">{form}</ThemedText>
            </View>
          ))}
        </View>

        {/* ─── NZ / SCI notes ─── */}
        <View style={[styles.notesBlock, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            NZ / SCI Notes
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 22 }}>
            {medication.notes}
          </ThemedText>
        </View>

        {/* ─── footer disclaimer ─── */}
        <View style={[styles.disclaimerBlock, { backgroundColor: theme.backgroundTertiary }]}>
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, lineHeight: 20 }}>
            This information is for reference only. Talk to your GP or spinal team before starting,
            changing, or stopping any medication. Do not stop medications suddenly without medical advice.
          </ThemedText>
        </View>

        {/* ─── sources ─── */}
        <View style={styles.sourcesBlock}>
          <ThemedText type="caption" style={[styles.sourcesHeading, { color: theme.textSecondary }]}>
            SOURCES
          </ThemedText>
          {[
            { label: "PHARMAC — New Zealand Pharmaceutical Schedule", url: "https://www.pharmac.govt.nz/pharmaceutical-schedule" },
            { label: "New Zealand Formulary (NZF) — Medicines Information", url: "https://nzf.org.nz/" },
          ].map(({ label, url }) => (
            <Pressable key={url} onPress={() => Linking.openURL(url)}>
              <ThemedText type="caption" style={styles.sourceLink}>{label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ─── title area ─── */
  titleBlock: {
    gap: Spacing.sm,
  },

  badgeRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },

  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },

  categoryTagText: {
    fontSize: 13,
    fontWeight: "600",
  },

  pharmacBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },

  /* ─── sections ─── */
  sectionHeading: {
    marginBottom: Spacing.xs,
  },

  bulletRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    paddingLeft: Spacing.xs,
    alignItems: "flex-start",
  },

  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
  },

  /* ─── serious block ─── */
  seriousBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  seriousHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  /* ─── notes ─── */
  notesBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    gap: Spacing.xs,
  },

  /* ─── disclaimer ─── */
  disclaimerBlock: {
    flexDirection: "row",
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: "flex-start",
  },

  sourcesBlock: {
    gap: Spacing.sm,
  },

  sourcesHeading: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  sourceLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
    lineHeight: 20,
  },
});
