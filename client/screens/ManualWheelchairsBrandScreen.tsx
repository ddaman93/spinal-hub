import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import {
  getChairsByBrand,
  MANUAL_CHAIR_BRAND_INFO,
  type ManualChairBrand,
  type ManualWheelchair,
  type ManualWheelchairFrameType,
  type ManualWheelchairSubcategory,
} from "@/data/manualWheelchairChairs";

type BrandScreenRoute = RouteProp<MainStackParamList, "ManualWheelchairsBrand">;

const ACCENT = "#3AA6FF";

/* ── Frame type tabs (Permobil / Melrose) ── */
type FrameTab = { key: ManualWheelchairFrameType; label: string };
const FRAME_TABS: FrameTab[] = [
  { key: "fixed",   label: "Fixed Frame" },
  { key: "folding", label: "Folding Frame" },
];

/* ── Subcategory tabs (Invacare) ── */
type SubcatKey = ManualWheelchairSubcategory | "all";
type SubcatTab = { key: SubcatKey; label: string };
const SUBCATEGORY_TABS: SubcatTab[] = [
  { key: "all",           label: "All" },
  { key: "active",        label: "Active" },
  { key: "standard",      label: "Standard" },
  { key: "tilt-in-space", label: "Tilt-in-space" },
  { key: "paediatric",    label: "Paediatric" },
  { key: "other",         label: "Other" },
];

export default function ManualWheelchairsBrandScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const { theme } = useTheme();
  const route = useRoute<BrandScreenRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { brandId } = route.params;

  const [search, setSearch] = useState("");
  const [activeFrame, setActiveFrame] = useState<ManualWheelchairFrameType>("fixed");
  const [activeSubcat, setActiveSubcat] = useState<SubcatKey>("all");

  const brand = MANUAL_CHAIR_BRAND_INFO.find((b) => b.id === brandId);
  const allChairs = useMemo(
    () => getChairsByBrand(brandId as ManualChairBrand),
    [brandId]
  );

  /* Detect which tab mode to use */
  const useSubcategoryMode = useMemo(
    () => allChairs.some((c) => c.subcategory !== undefined),
    [allChairs]
  );

  /* Frame mode tabs (Melrose / Permobil) */
  const hasFixed   = allChairs.some((c) => c.frameType === "fixed");
  const hasFolding = allChairs.some((c) => c.frameType === "folding");
  const showFrameTabs = !useSubcategoryMode && hasFixed && hasFolding;

  /* Subcategory tabs — only show tabs with products */
  const availableSubcatTabs = useMemo(() => {
    if (!useSubcategoryMode) return [];
    const present = new Set(allChairs.map((c) => c.subcategory));
    return SUBCATEGORY_TABS.filter(
      (t) => t.key === "all" || present.has(t.key as ManualWheelchairSubcategory)
    );
  }, [allChairs, useSubcategoryMode]);

  /* Filtered list (before search) */
  const tabFiltered = useMemo(() => {
    if (useSubcategoryMode) {
      return activeSubcat === "all"
        ? allChairs
        : allChairs.filter((c) => c.subcategory === activeSubcat);
    }
    return showFrameTabs
      ? allChairs.filter((c) => c.frameType === activeFrame)
      : allChairs;
  }, [allChairs, useSubcategoryMode, activeSubcat, showFrameTabs, activeFrame]);

  /* Search */
  const displayed = useMemo(() => {
    if (!search.trim()) return tabFiltered;
    const q = search.toLowerCase();
    return tabFiltered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.manufacturerLine.toLowerCase().includes(q)
    );
  }, [tabFiltered, search]);

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
        {/* BRAND HEADER */}
        {brand && (
          <View style={styles.header}>
            <ThemedText type="heading">{brand.title}</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.65, marginTop: 4 }}>
              {brand.description}
            </ThemedText>
          </View>
        )}

        {/* FRAME TYPE TABS (Permobil / Melrose) */}
        {showFrameTabs && (
          <View style={styles.tabRow}>
            {FRAME_TABS.map((tab) => {
              const active = tab.key === activeFrame;
              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.tab,
                    { borderColor: ACCENT },
                    active && { backgroundColor: ACCENT },
                  ]}
                  onPress={() => setActiveFrame(tab.key)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <ThemedText
                    type="small"
                    style={[
                      styles.tabText,
                      { color: active ? "#fff" : ACCENT },
                    ]}
                  >
                    {tab.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* SUBCATEGORY TABS (Invacare) */}
        {useSubcategoryMode && availableSubcatTabs.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {availableSubcatTabs.map((tab) => {
              const active = tab.key === activeSubcat;
              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.tab,
                    { borderColor: ACCENT },
                    active && { backgroundColor: ACCENT },
                  ]}
                  onPress={() => setActiveSubcat(tab.key)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <ThemedText
                    type="small"
                    style={[
                      styles.tabText,
                      { color: active ? "#fff" : ACCENT },
                    ]}
                  >
                    {tab.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* SEARCH */}
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: theme.backgroundDefault, color: theme.text },
          ]}
          placeholder="Search chairs…"
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        {/* PRODUCT GRID */}
        {displayed.length > 0 ? (
          <View style={styles.grid}>
            {displayed.map((chair) => (
              <ChairCard
                key={chair.id}
                chair={chair}
                onPress={() =>
                  navigation.navigate("ManualWheelchairDetail", {
                    productId: chair.id,
                  })
                }
                theme={theme}
              />
            ))}
          </View>
        ) : (
          <ThemedText
            type="body"
            style={[styles.empty, { color: theme.textSecondary }]}
          >
            {allChairs.length === 0
              ? "No chairs listed yet — check back soon."
              : `No results for "${search}".`}
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/* ───────── ChairCard — compact ProductCard styling ───────── */

function ChairCard({
  chair,
  onPress,
  theme,
}: {
  chair: ManualWheelchair;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={chair.title}
    >
      <Image
        source={chair.image ? { uri: chair.image } : undefined}
        style={[styles.cardImage, { backgroundColor: theme.backgroundTertiary }]}
        contentFit="cover"
      />
      <View style={styles.cardContent}>
        <ThemedText type="small" style={styles.cardTitle} numberOfLines={2}>
          {chair.title}
        </ThemedText>
        <ThemedText
          type="caption"
          numberOfLines={2}
          style={[styles.cardDesc, { color: theme.textSecondary }]}
        >
          {chair.description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

/* ───────── styles ───────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    marginBottom: Spacing.xs,
  },

  /* tabs */
  tabRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },

  /* search */
  searchInput: {
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },

  /* grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  empty: {
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },

  /* chair card — matches ProductCard compact */
  card: {
    width: 155,
    height: 145,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 68,
  },
  cardContent: {
    padding: 9,
    gap: 3,
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
  },
  cardDesc: {
    fontSize: 11,
  },
});
