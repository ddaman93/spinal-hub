import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CLINICAL_TRIALS } from "@/data/clinicalTrials";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type RouteProps = RouteProp<
  MainStackParamList,
  "ClinicalTrialDetail"
>;

export default function ClinicalTrialDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();

  const trial = CLINICAL_TRIALS.find(
    (t) => t.id === params.trialId
  );

  if (!trial) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Trial not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.lg,
        }}
      >
        {/* TITLE */}
        <ThemedText type="h2">{trial.title}</ThemedText>

        {/* META */}
        <View style={styles.meta}>
          <ThemedText type="caption">{trial.location}</ThemedText>
          <ThemedText type="caption">{trial.stage}</ThemedText>
        </View>

        {/* SUMMARY */}
        <ThemedText>{trial.summary}</ThemedText>

        {/* ELIGIBILITY */}
        {trial.eligibility?.length > 0 && (
          <>
            <ThemedText type="heading">
              Who this may apply to
            </ThemedText>

            <View style={styles.pillRow}>
              {trial.eligibility.map((item) => (
                <View key={item} style={styles.eligibilityPill}>
                  <ThemedText type="caption">
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </>
        )}

        {/* WHY IT MATTERS */}
        <ThemedText type="heading">Why it matters</ThemedText>
        <ThemedText>
          This research explores new approaches that may improve quality of life
          for people with spinal cord injury.
        </ThemedText>

        {/* SOURCES — THIS IS NOW IN THE RIGHT PLACE */}
        {trial.sources?.length > 0 && (
          <>
            <ThemedText
              type="heading"
              style={{ marginTop: Spacing.lg }}
            >
              Sources & Further Reading
            </ThemedText>

            {trial.sources.map((source) => (
              <Pressable
                key={source.url}
                onPress={() =>
                  WebBrowser.openBrowserAsync(source.url)
                }
                style={styles.sourceLink}
              >
                <ThemedText type="link">
                  {source.label}
                </ThemedText>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    opacity: 0.7,
  },
  sourceLink: {
    marginTop: Spacing.xs,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },

  eligibilityPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(77,163,255,0.25)",
  },
});