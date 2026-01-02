import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { CLINICAL_TRIALS } from "@/data/clinicalTrials";
import { ClinicalTrialCard } from "@/components/ClinicalTrialCard";

export default function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const handleCategoryPress = useCallback(
    (category: CategoryConfig) => {
      navigation.navigate("CategoryDetail", {
        category: category.id,
        title: category.title,
      });
    },
    [navigation]
  );

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

        {/* ASSISTIVE TECHNOLOGY SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">Assistive Technology</ThemedText>

            <ThemedText
              type="link"
              onPress={() => navigation.navigate("AssistiveTechList")}
            >
              View all →
            </ThemedText>
          </View>

          <ThemedText type="small" style={styles.sectionSubtitle}>
            Tools and equipment that improve independence
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {ASSISTIVE_TECH_ITEMS.map((item) => (
              <AssistiveTechCard
                key={item.id}
                item={item}
                onPress={() =>
                  navigation.navigate("AssistiveTechDetail", {
                    itemId: item.id,
                  })
                }
              />
            ))}
          </ScrollView>
        </View>
        {/* CLINICAL TRIALS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">Clinical Trials & Research</ThemedText>

            <ThemedText
              type="link"
              onPress={() => navigation.navigate("ClinicalTrialsList")}
            >
              View all →
            </ThemedText>
          </View>

          <ThemedText type="small" style={styles.sectionSubtitle}>
            Global research and trials related to spinal cord injury
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {CLINICAL_TRIALS.map((item) => (
              <ClinicalTrialCard
                key={item.id}
                item={item}
                onPress={() =>
                  navigation.navigate("ClinicalTrialDetail", {
                    trialId: item.id,
                  })
                }
              />
            ))}
          </ScrollView>
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
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    opacity: 0.7,
    marginBottom: Spacing.md,
  },
  horizontalList: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  card: {
    width: 280, // 👈 important
    padding: Spacing.md,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    gap: Spacing.sm,
  },
});