import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";
import { LiveClinicalTrialCard } from "@/components/LiveClinicalTrialCard";
import { TechNavCard } from "@/components/TechNavCard";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";

/* ───────────────── helpers ───────────────── */

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* ───────────────── types ───────────────── */

type WeatherData = {
  temp: number;
  icon: string;
  city: string;
};

type LiveTrial = {
  id: string;
  title: string;
  status: string;
  phase?: string;
  summary?: string;
  country?: string;
};

/* ───────────────── constants ───────────────── */

const TRIALS_CACHE_KEY = "clinical_trials_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24;

/* ───────────────── screen ───────────────── */

export default function DashboardScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MainStackParamList>
    >();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const userName = "Dylan";

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [liveTrials, setLiveTrials] =
    useState<LiveTrial[]>([]);
  const [liveLoading, setLiveLoading] =
    useState(false);

  /* ───────── weather ───────── */
  React.useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location =
          await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const apiKey =
          process.env.EXPO_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) return;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setWeather({
            temp: Math.round(data.main.temp),
            icon: data.weather[0].icon,
            city: data.name,
          });
        }
      } catch {}
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────── trials ───────── */
  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      async function loadTrials() {
        try {
          const cached = await AsyncStorage.getItem(
            TRIALS_CACHE_KEY
          );

          if (cached) {
            const parsed = JSON.parse(cached);
            if (active) setLiveTrials(parsed.trials);

            if (
              Date.now() - parsed.timestamp <
              CACHE_TTL
            ) {
              return;
            }
          }

          setLiveLoading(true);

          const res = await fetch(
            "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=20&sort=LastUpdatePostDate:desc"
          );

          const data = await res.json();

          const trials: LiveTrial[] =
            data.studies?.map((study: any) => {
              const protocol =
                study.protocolSection;

              return {
                id:
                  protocol.identificationModule
                    .nctId,
                title:
                  protocol.identificationModule
                    .briefTitle ??
                  "Untitled study",
                status:
                  protocol.statusModule
                    .overallStatus ??
                  "Unknown",
                phase:
                  protocol.designModule
                    ?.phases?.[0],
                summary:
                  protocol.descriptionModule
                    ?.briefSummary,
                country:
                  protocol.contactsLocationsModule
                    ?.locations?.[0]?.country,
              };
            }) ?? [];

          if (active) setLiveTrials(trials);

          await AsyncStorage.setItem(
            TRIALS_CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              trials,
            })
          );
        } catch {
        } finally {
          if (active) setLiveLoading(false);
        }
      }

      loadTrials();
      return () => {
        active = false;
      };
    }, [])
  );

  const handleCategoryPress = useCallback(
    (category: CategoryConfig) => {
      navigation.navigate("CategoryDetail", {
        category: category.id,
        title: category.title,
      });
    },
    [navigation]
  );

  /* ───────────────── render ───────────────── */

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
        {/* GREETING */}
        <View style={styles.topRow}>
          <View>
            <ThemedText type="heading">
              {getGreeting()}, {userName}
            </ThemedText>
            <ThemedText
              type="small"
              style={styles.subtitle}
            >
              Welcome back to Spinal Hub
            </ThemedText>
          </View>

          {weather && (
            <View style={styles.weather}>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
                }}
                style={styles.weatherIcon}
              />
              <View>
                <ThemedText type="small">
                  {weather.temp}°C
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ opacity: 0.7 }}
                >
                  {weather.city}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* CATEGORY GRID */}
        <View style={styles.grid}>
          {CATEGORIES.map((category) => (
            <CategoryTile
              key={category.id}
              title={category.title}
              icon={category.icon}
              onPress={() =>
                handleCategoryPress(category)
              }
            />
          ))}
        </View>

        {/* ASSISTIVE TECHNOLOGY */}
        <View style={styles.section}>
          <View style={styles.laneHeader}>
            <ThemedText type="heading">
              Assistive Technology
            </ThemedText>
          </View>

          {/* MOBILITY & WHEELCHAIR TECH */}
          <View style={{ marginTop: Spacing.md }}>
            <View style={styles.laneHeader}>
              <ThemedText
                type="small"
                style={{ opacity: 0.8 }}
              >
                Mobility & Wheelchair Tech
              </ThemedText>

              <Pressable
                onPress={() =>
                  navigation.navigate(
                    "MobilityAssistiveTech"
                  )
                }
              >
                <ThemedText type="link">
                  View all →
                </ThemedText>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: Spacing.md,
              }}
            >
              <TechNavCard
                title="Manual Wheelchair Tech"
                subtitle="Power assist wheels, handcycles, propulsion aids"
                image="https://upload.wikimedia.org/wikipedia/commons/4/4e/Manual_wheelchair.jpg"
                onPress={() =>
                  navigation.navigate(
                    "ManualWheelchairTech"
                  )
                }
              />

              <TechNavCard
                title="Power Wheelchair Tech"
                subtitle="Seating, controls, drive & access systems"
                image="https://upload.wikimedia.org/wikipedia/commons/5/55/Power_wheelchair.jpg"
                onPress={() =>
                  navigation.navigate(
                    "PowerWheelchairTech"
                  )
                }
              />
            </ScrollView>
          </View>
        </View>

        {/* LIVE CLINICAL TRIALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">
              Live Clinical Trials
            </ThemedText>

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "ClinicalTrialsList",
                  { trials: liveTrials }
                )
              }
            >
              <ThemedText style={styles.viewAll}>
                View all →
              </ThemedText>
            </Pressable>
          </View>

          {!liveLoading && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: Spacing.md,
              }}
            >
              {liveTrials.map((trial) => (
                <LiveClinicalTrialCard
                  key={trial.id}
                  {...trial}
                  variant="carousel"
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────── styles ───────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },

  subtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },

  weather: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  weatherIcon: {
    width: 36,
    height: 36,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  section: {
    marginTop: Spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  laneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },

  viewAll: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3AA6FF",
  },
});