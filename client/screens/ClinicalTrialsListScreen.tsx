import React, { useMemo, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Switch,
  Pressable,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LiveClinicalTrialCard } from "@/components/LiveClinicalTrialCard";
import { Spacing } from "@/constants/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "@/types/navigation";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<
  MainStackParamList,
  "ClinicalTrialsList"
>;

const CACHE_KEY = "clinical_trials_cache";

export default function ClinicalTrialsListScreen({ route }: Props) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [showRecruitingOnly, setShowRecruitingOnly] =
    useState(false);

  // ✅ SAFE DEFAULT
  const [allTrials, setAllTrials] = useState(
    route.params?.trials ?? []
  );

  /* ───────── filtered list ───────── */
  const filteredTrials = useMemo(() => {
    if (!showRecruitingOnly) return allTrials;

    return allTrials.filter(
      (t) => t.status === "RECRUITING"
    );
  }, [showRecruitingOnly, allTrials]);

  /* ───────── pull to refresh ───────── */
  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const res = await fetch(
        "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=25&sort=LastUpdatePostDate:desc"
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      const refreshed =
        data.studies?.map((study: any) => {
          const protocol = study.protocolSection;
          const locations =
            protocol.contactsLocationsModule?.locations ??
            [];

          return {
            id: protocol.identificationModule.nctId,
            title:
              protocol.identificationModule.briefTitle ??
              "Untitled study",
            status:
              protocol.statusModule.overallStatus ??
              "Unknown",
            phase:
              protocol.designModule?.phases?.[0],
            summary:
              protocol.descriptionModule?.briefSummary,
            country: locations[0]?.country,
          };
        }) ?? [];

      setAllTrials(refreshed);

      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          trials: refreshed,
        })
      );
    } catch {
      // silent fail
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00C896"
          />
        }
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <ThemedText type="heading">
            Clinical Trials
          </ThemedText>

          <Pressable
            onPress={() =>
              setShowRecruitingOnly((v) => !v)
            }
            style={styles.toggle}
          >
            <ThemedText type="small">
              Recruiting only
            </ThemedText>
            <Switch
              value={showRecruitingOnly}
              onValueChange={setShowRecruitingOnly}
            />
          </Pressable>
        </View>

        {/* EMPTY STATE */}
        {filteredTrials.length === 0 && (
          <ThemedText
            type="small"
            style={{ opacity: 0.6 }}
          >
            No trials to display.
          </ThemedText>
        )}

        {/* GRID */}
        <View style={styles.grid}>
          {filteredTrials.map((trial) => (
            <View key={trial.id} style={styles.gridItem}>
              <LiveClinicalTrialCard
                {...trial}
                variant="grid"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ───────── styles ───────── */

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: Spacing.lg,
  },
});