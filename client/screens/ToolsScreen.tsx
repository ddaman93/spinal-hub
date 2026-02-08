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

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";

export default function ToolsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  // 3-column grid: screenWidth minus horizontal padding and 2 gaps
  const tileWidth =
    (Dimensions.get("window").width - Spacing.lg * 2 - Spacing.md * 2) / 3;

  const handleCategoryPress = useCallback(
    (category: CategoryConfig) => {
      // If category has a direct route, navigate there instead of CategoryDetail
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* TITLE */}
        <View style={styles.header}>
          <ThemedText type="heading">
            Available Tools
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Access all your health and wellness tools
          </ThemedText>
        </View>

        {/* CATEGORY GRID */}
        <View style={styles.grid}>
          {CATEGORIES.map((category) => {
            const isNZST = category.id === "nz-spinal-trust";
            return (
              <CategoryTile
                key={category.id}
                title={category.title}
                icon={category.icon}
                onPress={() => handleCategoryPress(category)}
                style={{ width: tileWidth }}
                {...(isNZST && {
                  customIcon: <NZSpinalTrustLogo size={30} />,
                  accentColor: "#FFA800",
                  iconBg: "rgba(72,138,201,0.12)",
                })}
              />
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    marginBottom: Spacing.lg,
  },

  subtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
});
