import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { useTheme } from "@/hooks/useTheme";
import { WHEELCHAIR_CATEGORIES } from "@/data/wheelchairCategories";
import { MANUAL_CHAIR_BRAND_INFO } from "@/data/manualWheelchairChairs";
import { POWER_CHAIR_BRAND_INFO } from "@/data/powerWheelchairs";
import { SPORTS_CHAIR_BRAND_INFO } from "@/data/sportsWheelchairs";
import { SPECIALTY_CHAIR_BRAND_INFO } from "@/data/specialtyWheelchairs";
import { AIRLINE_CHAIR_BRAND_INFO } from "@/data/airlineWheelchairs";

type AllWheelchairsScreenProps = NativeStackScreenProps<
  MainStackParamList,
  "AllWheelchairs"
>;

/* ───────────── screen ───────────── */

export default function AllWheelchairsScreen({}: AllWheelchairsScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const route = useRoute<AllWheelchairsScreenProps["route"]>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params?.categoryId ?? "manual-wheelchairs"
  );

  const category = WHEELCHAIR_CATEGORIES.find((c) => c.id === selectedCategory);

  /* ───── render content for selected category ───── */

  function renderContent() {
    /* ── Manual Wheelchairs: brand card grid ── */
    if (selectedCategory === "manual-wheelchairs") {
      return (
        <View style={styles.brandGrid}>
          {MANUAL_CHAIR_BRAND_INFO.map((brand) => (
            <Pressable
              key={brand.id}
              style={[
                styles.brandCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() =>
                navigation.navigate("ManualWheelchairsBrand", {
                  brandId: brand.id,
                })
              }
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Browse ${brand.title} manual wheelchairs`}
            >
              <Image
                source={brand.image ? { uri: brand.image } : undefined}
                style={[
                  styles.brandCardImage,
                  { backgroundColor: theme.backgroundTertiary },
                ]}
                contentFit="cover"
              />
              <View style={styles.brandCardContent}>
                <ThemedText
                  type="small"
                  style={styles.brandCardTitle}
                >
                  {brand.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  numberOfLines={3}
                  style={[
                    styles.brandCardDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {brand.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    /* ── Power Wheelchairs: brand cards ── */
    if (selectedCategory === "power-wheelchairs") {
      return (
        <View style={styles.brandGrid}>
          {POWER_CHAIR_BRAND_INFO.map((brand) => (
            <Pressable
              key={brand.id}
              style={[
                styles.brandCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() =>
                navigation.navigate("PowerWheelchairsBrand", {
                  brandId: brand.id,
                })
              }
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Browse ${brand.title} power wheelchairs`}
            >
              <Image
                source={brand.image ? { uri: brand.image } : undefined}
                style={[
                  styles.brandCardImage,
                  { backgroundColor: brand.imageBg ?? theme.backgroundTertiary },
                ]}
                contentFit={brand.imageContentFit ?? "cover"}
              />
              <View style={styles.brandCardContent}>
                <ThemedText type="small" style={styles.brandCardTitle}>
                  {brand.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  numberOfLines={3}
                  style={[
                    styles.brandCardDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {brand.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    /* ── Sports Wheelchairs: brand cards ── */
    if (selectedCategory === "sports-wheelchairs") {
      return (
        <View style={styles.brandGrid}>
          {SPORTS_CHAIR_BRAND_INFO.map((brand) => (
            <Pressable
              key={brand.id}
              style={[
                styles.brandCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() =>
                navigation.navigate("SportsWheelchairsBrand", {
                  brandId: brand.id,
                })
              }
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Browse ${brand.title} sports wheelchairs`}
            >
              <Image
                source={brand.image ? { uri: brand.image } : undefined}
                style={[
                  styles.brandCardImage,
                  { backgroundColor: brand.imageBg ?? theme.backgroundTertiary },
                ]}
                contentFit={brand.imageContentFit ?? "cover"}
              />
              <View style={styles.brandCardContent}>
                <ThemedText type="small" style={styles.brandCardTitle}>
                  {brand.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  numberOfLines={3}
                  style={[
                    styles.brandCardDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {brand.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    /* ── Specialty Wheelchairs: brand cards ── */
    if (selectedCategory === "specialty-chairs") {
      return (
        <View style={styles.brandGrid}>
          {SPECIALTY_CHAIR_BRAND_INFO.map((brand) => (
            <Pressable
              key={brand.id}
              style={[
                styles.brandCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() =>
                navigation.navigate("SpecialtyWheelchairsBrand", {
                  brandId: brand.id,
                })
              }
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Browse ${brand.title} specialty wheelchairs`}
            >
              <Image
                source={brand.image ? { uri: brand.image } : undefined}
                style={[
                  styles.brandCardImage,
                  { backgroundColor: brand.imageBg ?? theme.backgroundTertiary },
                ]}
                contentFit={brand.imageContentFit ?? "cover"}
              />
              <View style={styles.brandCardContent}>
                <ThemedText type="small" style={styles.brandCardTitle}>
                  {brand.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  numberOfLines={3}
                  style={[
                    styles.brandCardDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {brand.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    /* ── Airline Wheelchairs: brand cards ── */
    if (selectedCategory === "airline-chairs") {
      return (
        <View style={styles.brandGrid}>
          {AIRLINE_CHAIR_BRAND_INFO.map((brand) => (
            <Pressable
              key={brand.id}
              style={[
                styles.brandCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() =>
                navigation.navigate("AirlineWheelchairsBrand", {
                  brandId: brand.id,
                })
              }
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Browse ${brand.title} airline wheelchairs`}
            >
              <Image
                source={brand.image ? { uri: brand.image } : undefined}
                style={[
                  styles.brandCardImage,
                  { backgroundColor: brand.imageBg ?? theme.backgroundTertiary },
                ]}
                contentFit={brand.imageContentFit ?? "cover"}
              />
              <View style={styles.brandCardContent}>
                <ThemedText type="small" style={styles.brandCardTitle}>
                  {brand.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  numberOfLines={3}
                  style={[
                    styles.brandCardDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {brand.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    /* ── All other categories: coming soon ── */
    return (
      <View style={styles.comingSoon}>
        <ThemedText type="small" style={{ opacity: 0.6 }}>
          Coming soon — we're building out this section.
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading">{category?.title ?? "Wheelchairs"}</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            {category?.description ?? "Browse wheelchair options by category."}
          </ThemedText>
        </View>

        {/* CATEGORY BUBBLE TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ marginBottom: Spacing.lg }}
        >
          {WHEELCHAIR_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.bubble,
                selectedCategory === cat.id && styles.bubbleActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <ThemedText
                type="caption"
                style={[
                  styles.bubbleText,
                  selectedCategory === cat.id && styles.bubbleTextActive,
                ]}
                numberOfLines={1}
              >
                {cat.title}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* CONTENT */}
        {renderContent()}
      </ScrollView>
    </ThemedView>
  );
}


/* ───────── styles ───────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    marginBottom: Spacing.lg,
  },

  subtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },

  bubble: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    backgroundColor: "transparent",
  },

  bubbleActive: {
    backgroundColor: "#3AA6FF",
    borderColor: "#3AA6FF",
  },

  bubbleText: {
    color: "#999",
  },

  bubbleTextActive: {
    color: "#000",
    fontWeight: "600",
  },

  /* ── manual brand grid ── */

  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },

  brandCard: {
    width: 130,
    borderRadius: 16,
    overflow: "hidden",
  },

  brandCardImage: {
    width: "100%",
    height: 72,
  },

  brandCardContent: {
    padding: 10,
    gap: 4,
  },

  brandCardTitle: {
    fontSize: 13,
    fontWeight: "600",
  },

  brandCardDescription: {
    fontSize: 11,
    lineHeight: 15,
  },

  comingSoon: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
});
