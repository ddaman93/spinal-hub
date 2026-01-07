import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";
import { ClinicalTrialCard } from "@/components/ClinicalTrialCard";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { CLINICAL_TRIALS } from "@/data/clinicalTrials";

type LiveTrial = {
  id: string;
  title: string;
  status: string;
};

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

  // Web-only live data proof (no React Query yet)
  const [liveTrials, setLiveTrials] = useState<LiveTrial[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLiveLoading(true);
      setLiveError(null);

      try {
        const res = await fetch("/api/clinical-trials?condition=spinal%20cord%20injury&pageSize=5");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          setLiveTrials(data.studies ?? []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLiveError(e?.message ?? "Failed to load");
        }
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

          {/* LIVE DATA PROOF (web-only for now) */}
          {liveLoading && <ThemedText type="small">Loading live trials…</ThemedText>}
          {liveError && (
            <ThemedText type="small">Live trials error: {liveError}</ThemedText>
          )}
          {!liveLoading && !liveError && liveTrials.length > 0 && (
            <View style={{ marginBottom: Spacing.md }}>
              <ThemedText type="small">Live trials loaded: {liveTrials.length}</ThemedText>
              {liveTrials.slice(0, 3).map((t) => (
                <ThemedText key={t.id} type="small" style={{ opacity: 0.85 }}>
                  • {t.title} ({t.status})
                </ThemedText>
              ))}
            </View>
          )}

          {/* Keep your existing static cards until we adapt ClinicalTrialCard */}
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
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  section: { marginTop: Spacing.xl },
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
});