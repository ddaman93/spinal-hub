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
  getAirlineChairsByBrand,
  AIRLINE_CHAIR_BRAND_INFO,
  type AirlineWheelchairBrand,
  type AirlineWheelchairProduct,
  type AirlineType,
} from "@/data/airlineWheelchairs";

type BrandScreenRoute = RouteProp<MainStackParamList, "AirlineWheelchairsBrand">;

const ACCENT = "#3AA6FF";

type AirlineKey = AirlineType | "all";
type AirlineTab = { key: AirlineKey; label: string };

const AIRLINE_TABS: AirlineTab[] = [
  { key: "all",              label: "All" },
  { key: "aisle-fixed",      label: "Aisle (Fixed)" },
  { key: "onboard-folding",  label: "Onboard (Folding)" },
  { key: "onboard-lift",     label: "Onboard Lift" },
  { key: "terminal-transit", label: "Terminal/Transit" },
];

export default function AirlineWheelchairsBrandScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const { theme } = useTheme();
  const route = useRoute<BrandScreenRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { brandId } = route.params;

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<AirlineKey>("all");

  const brand = AIRLINE_CHAIR_BRAND_INFO.find((b) => b.id === brandId);
  const allChairs = useMemo(
    () => getAirlineChairsByBrand(brandId as AirlineWheelchairBrand),
    [brandId]
  );

  const availableTabs = useMemo(() => {
    const present = new Set(allChairs.map((c) => c.airlineType));
    return AIRLINE_TABS.filter(
      (t) => t.key === "all" || present.has(t.key as AirlineType)
    );
  }, [allChairs]);

  const typeFiltered = useMemo(
    () =>
      activeType === "all"
        ? allChairs
        : allChairs.filter((c) => c.airlineType === activeType),
    [allChairs, activeType]
  );

  const displayed = useMemo(() => {
    if (!search.trim()) return typeFiltered;
    const q = search.toLowerCase();
    return typeFiltered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [typeFiltered, search]);

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
            <ThemedText type="heading">{brand.title} Airline</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.65, marginTop: 4 }}>
              {brand.description}
            </ThemedText>
          </View>
        )}

        {/* TYPE CHIPS */}
        {availableTabs.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {availableTabs.map((tab) => {
              const active = tab.key === activeType;
              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.tab,
                    { borderColor: ACCENT },
                    active && { backgroundColor: ACCENT },
                  ]}
                  onPress={() => setActiveType(tab.key)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <ThemedText
                    type="small"
                    style={[styles.tabText, { color: active ? "#fff" : ACCENT }]}
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
              <AirlineChairCard
                key={chair.id}
                chair={chair}
                onPress={() =>
                  navigation.navigate("AirlineWheelchairDetail", {
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

/* ───────── AirlineChairCard ───────── */

function AirlineChairCard({
  chair,
  onPress,
  theme,
}: {
  chair: AirlineWheelchairProduct;
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

  searchInput: {
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
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
