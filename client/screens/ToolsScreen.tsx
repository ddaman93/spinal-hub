import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";

export default function ToolsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const handleCategoryPress = useCallback(
    (category: CategoryConfig) => {
      // If category has a direct route, navigate there instead of CategoryDetail
      if (category.route) {
        navigation.navigate(category.route);
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
          {CATEGORIES.map((category) => (
            <CategoryTile
              key={category.id}
              title={category.title}
              icon={category.icon}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
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
    gap: Spacing.md,
  },
});
