import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { CategoryTile } from "@/components/CategoryTile";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog"
import type { CategoryConfig } from "@/config/catalog";


export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const handleCategoryPress = useCallback((category: CategoryConfig) => {

    navigation.navigate("CategoryDetail", {
      category: category.id,
      title: category.title,
    });
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
});
