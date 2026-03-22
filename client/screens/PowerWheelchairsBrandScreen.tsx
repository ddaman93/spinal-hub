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
  getPowerChairsByBrand,
  POWER_CHAIR_BRAND_INFO,
  type PowerWheelchairBrand,
  type PowerWheelchair,
  type PowerWheelchairDriveType,
} from "@/data/powerWheelchairs";

const ACCENT = "#3AA6FF";

type DriveTab = { key: PowerWheelchairDriveType | "all"; label: string };
const DRIVE_TABS: DriveTab[] = [
  { key: "all",         label: "All" },
  { key: "mid-wheel",   label: "Mid-Wheel" },
  { key: "front-wheel", label: "Front-Wheel" },
  { key: "rear-wheel",  label: "Rear-Wheel" },
  { key: "other",       label: "Other" },
];

type BrandScreenRoute = RouteProp<MainStackParamList, "PowerWheelchairsBrand">;

export default function PowerWheelchairsBrandScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const { theme } = useTheme();
  const route = useRoute<BrandScreenRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { brandId } = route.params;

  const [search, setSearch] = useState("");
  const [activeDrive, setActiveDrive] = useState<PowerWheelchairDriveType | "all">("all");

  const brand = POWER_CHAIR_BRAND_INFO.find((b) => b.id === brandId);
  const allChairs = useMemo(
    () => getPowerChairsByBrand(brandId as PowerWheelchairBrand),
    [brandId]
  );

  /* Only show drive tabs if any product has driveType set */
  const useDriveTabs = useMemo(
    () => allChairs.some((c) => c.driveType !== undefined),
    [allChairs]
  );

  const availableDriveTabs = useMemo(() => {
    if (!useDriveTabs) return [];
    const present = new Set(allChairs.map((c) => c.driveType));
    return DRIVE_TABS.filter((t) => t.key === "all" || present.has(t.key as PowerWheelchairDriveType));
  }, [allChairs, useDriveTabs]);

  const driveFiltered = useMemo(() => {
    if (!useDriveTabs || activeDrive === "all") return allChairs;
    return allChairs.filter((c) => c.driveType === activeDrive);
  }, [allChairs, useDriveTabs, activeDrive]);

  const displayed = useMemo(() => {
    if (!search.trim()) return driveFiltered;
    const q = search.toLowerCase();
    return driveFiltered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [driveFiltered, search]);

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

        {/* DRIVE TYPE BUBBLES (Permobil) */}
        {useDriveTabs && availableDriveTabs.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bubbleRow}
          >
            {availableDriveTabs.map((tab) => {
              const active = tab.key === activeDrive;
              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.bubble,
                    active && { backgroundColor: ACCENT, borderColor: ACCENT },
                  ]}
                  onPress={() => setActiveDrive(tab.key)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <ThemedText
                    type="caption"
                    style={[styles.bubbleText, active && styles.bubbleTextActive]}
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
              <PowerChairCard
                key={chair.id}
                chair={chair}
                onPress={() =>
                  navigation.navigate("PowerWheelchairDetail", {
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

/* ───────── PowerChairCard ───────── */

function PowerChairCard({
  chair,
  onPress,
  theme,
}: {
  chair: PowerWheelchair;
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
        style={[styles.cardImage, { backgroundColor: "#fff" }]}
        contentFit="contain"
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

  bubbleRow: {
    flexDirection: "row",
    gap: 8,
  },

  bubble: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    backgroundColor: "transparent",
  },

  bubbleText: {
    color: "#999",
  },

  bubbleTextActive: {
    color: "#000",
    fontWeight: "600",
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
