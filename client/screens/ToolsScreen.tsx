import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";
import NZSpinalTrustLogo from "@/components/icons/NZSpinalTrustLogo";
import { TourTarget } from "@/components/TourTarget";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";
import { useTheme } from "@/hooks/useTheme";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";

/* ── accent colours per category ── */
const ACCENT: Record<string, string> = {
  "daily-routine":            "#FF9500",
  "health-tracking":          "#00BCD4",
  "care-support":             "#34C759",
  "appointments":             "#AF52DE",
  "medications":              "#FF3B30",
  "skin-care":                "#FF6B6B",
  "nz-spinal-trust":          "#FFA800",
  "sci-medications":          "#00BCD4",
  "ccs-disability-action":    "#00875A",
  "mobility-taxis":           "#1C7ED6",
  "accessible-transport-map": "#5C6BC0",
  "carer-companies":          "#FF6B6B",
  "spinal-rehab-units":       "#1A6B9E",
  "mental-health":            "#6B4FA2",
  "community-chat":           "#5B8DEF",
  "back-on-track":            "#1A6B9E",
};

/* ── section groupings ── */
const SECTIONS = [
  {
    title: "Health & Wellness",
    ids: ["daily-routine", "health-tracking", "skin-care", "medications", "care-support", "appointments"],
  },
  {
    title: "Support & Resources",
    ids: [
      "nz-spinal-trust",
      "sci-medications",
      "ccs-disability-action",
      "spinal-rehab-units",
      "mental-health",
      "community-chat",
      "back-on-track",
    ],
  },
  {
    title: "Transport & Mobility",
    ids: ["mobility-taxis", "accessible-transport-map", "carer-companies"],
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 12;
const GAP = 6;
const COLS = 3;
const TILE_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

export default function ToolsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const scrollProps = useScrollAwareHeader();

  const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  const handlePress = useCallback(
    (category: CategoryConfig) => {
      if (category.route) {
        navigation.navigate(category.route as any);
      } else {
        navigation.navigate("CategoryDetail", {
          category: category.id,
          title: category.title,
        });
      }
    },
    [navigation],
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: H_PAD + 4,
          gap: Spacing.xl,
        }}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.headerAccent, { backgroundColor: theme.primary }]} />
            <ThemedText style={styles.headerTitle}>Tools</ThemedText>
          </View>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Everything you need, in one place
          </ThemedText>
        </View>

        {/* ── SECTIONS ── */}
        <TourTarget stepId="tools-grid">
        {SECTIONS.map((section) => {
          const categories = section.ids
            .map((id) => categoryById[id])
            .filter(Boolean);

          // Chunk into rows to avoid flexWrap height bug in RN
          const rows: CategoryConfig[][] = [];
          for (let i = 0; i < categories.length; i += COLS) {
            rows.push(categories.slice(i, i + COLS));
          }

          return (
            <View key={section.title} style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {section.title.toUpperCase()}
              </ThemedText>

              <View style={styles.grid}>
                {rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((category) => {
                      const accent = ACCENT[category.id] ?? theme.primary;
                      const isNZST = category.id === "nz-spinal-trust";
                      const isBackOnTrack = category.id === "back-on-track";
                      return (
                        <CategoryTile
                          key={category.id}
                          title={category.title}
                          description={category.description}
                          icon={category.icon}
                          accentColor={accent}
                          onPress={() => handlePress(category)}
                          style={{ width: TILE_WIDTH }}
                          {...(isNZST && {
                            customIcon: <NZSpinalTrustLogo size={20} />,
                          })}
                          {...(isBackOnTrack && {
                            imageUri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Spinal%20hub%20photos/Books/Back%20on%20track.jpg",
                          })}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
        </TourTarget>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    gap: Spacing.xs,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 12, // aligns under the title past the accent bar
  },

  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  grid: {
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
});
