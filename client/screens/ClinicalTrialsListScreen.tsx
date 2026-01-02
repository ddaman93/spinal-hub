import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ClinicalTrialCard } from "@/components/ClinicalTrialCard";

import { CLINICAL_TRIALS } from "@/data/clinicalTrials";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

export default function ClinicalTrialsListScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  // Filters
  const [activeTag, setActiveTag] =
    useState<string | null>(null);
  const [activeEligibility, setActiveEligibility] =
    useState<string | null>(null);

  // Extract unique tags
  const allTags = Array.from(
    new Set(
      CLINICAL_TRIALS.flatMap(
        (item) => item.tags
      )
    )
  );

  // Extract unique eligibility options
  const allEligibility = Array.from(
    new Set(
      CLINICAL_TRIALS.flatMap(
        (item) => item.eligibility
      )
    )
  );

  // Combined filtering logic
  const filteredTrials = CLINICAL_TRIALS.filter(
    (item) => {
      const tagMatch = activeTag
        ? item.tags.includes(activeTag)
        : true;

      const eligibilityMatch = activeEligibility
        ? item.eligibility.includes(
            activeEligibility
          )
        : true;

      return tagMatch && eligibilityMatch;
    }
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom:
            insets.bottom + Spacing.xl,
          gap: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View>
          <ThemedText type="h2">
            Clinical Trials & Research
          </ThemedText>
          <ThemedText
            type="small"
            style={styles.subtitle}
          >
            Global research related to spinal
            cord injury
          </ThemedText>
        </View>

        {/* TAG FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            onPress={() => setActiveTag(null)}
            style={[
              styles.filterPill,
              !activeTag &&
                styles.filterPillActive,
            ]}
          >
            <ThemedText type="caption">
              All tags
            </ThemedText>
          </Pressable>

          {allTags.map((tag) => {
            const active = activeTag === tag;

            return (
              <Pressable
                key={tag}
                onPress={() =>
                  setActiveTag(
                    active ? null : tag
                  )
                }
                style={[
                  styles.filterPill,
                  active &&
                    styles.filterPillActive,
                ]}
              >
                <ThemedText type="caption">
                  {tag.replace("-", " ")}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ELIGIBILITY FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            onPress={() =>
              setActiveEligibility(null)
            }
            style={[
              styles.filterPill,
              !activeEligibility &&
                styles.filterPillActive,
            ]}
          >
            <ThemedText type="caption">
              All eligibility
            </ThemedText>
          </Pressable>

          {allEligibility.map((entry) => {
            const active =
              activeEligibility === entry;

            return (
              <Pressable
                key={entry}
                onPress={() =>
                  setActiveEligibility(
                    active ? null : entry
                  )
                }
                style={[
                  styles.filterPill,
                  active &&
                    styles.filterPillActive,
                ]}
              >
                <ThemedText type="caption">
                  {entry}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* FILTERED LIST */}
        {filteredTrials.map((trial) => (
          <ClinicalTrialCard
            key={trial.id}
            item={trial}
            onPress={() =>
              navigation.navigate(
                "ClinicalTrialDetail",
                {
                  trialId: trial.id,
                }
              )
            }
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  filterRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },
  filterPillActive: {
    backgroundColor:
      "rgba(77,163,255,0.35)",
  },
});