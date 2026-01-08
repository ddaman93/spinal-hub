import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";
import { ClinicalTrialCard } from "@/components/ClinicalTrialCard";
import { getApiUrl } from "@/lib/query-client";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { CATEGORIES } from "@/config/catalog";
import type { CategoryConfig } from "@/config/catalog";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { CLINICAL_TRIALS } from "@/data/clinicalTrials";

/* ───────────────────────── helpers ───────────────────────── */

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* ───────────────────────── types ───────────────────────── */

type LiveTrial = {
  id: string;
  title: string;
  status: string;
};

type WeatherData = {
  temp: number;
  icon: string;
};

/* ───────────────────────── screen ───────────────────────── */

export default function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  // TODO: Replace with real auth user
  const userName = "Dylan";

  /* ───────── weather state ───────── */
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) return;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();

        if (!cancelled) {
          setWeather({
            temp: Math.round(data.main.temp),
            icon: data.weather[0].icon,
          });
        }
      } catch {
        // Silently fail – dashboard should never break
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────── category nav ───────── */
  const handleCategoryPress = useCallback(
    (category: CategoryConfig) => {
      navigation.navigate("CategoryDetail", {
        category: category.id,
        title: category.title,
      });
    },
    [navigation]
  );

  /* ───────── live trials (unchanged) ───────── */
  const [liveTrials, setLiveTrials] = useState<LiveTrial[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLiveLoading(true);
      setLiveError(null);

      try {
        const apiUrl = getApiUrl();
        const url = new URL(
          "/api/clinical-trials?condition=spinal%20cord%20injury&pageSize=5",
          apiUrl
        );
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          setLiveTrials(data.studies ?? []);
        }
      } catch (e: any) {
        if (!cancelled) setLiveError(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────────────────────── render ───────────────────────── */

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* GREETING + WEATHER */}
        <View style={styles.topRow}>
          <View>
            <ThemedText type="heading">
              {getGreeting()}, {userName}
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
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
              <ThemedText type="small">{weather.temp}°C</ThemedText>
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
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>

        {/* ASSISTIVE TECH */}
        <View style={styles.section}>
          <ThemedText type="heading">Assistive Technology</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ASSISTIVE_TECH_ITEMS.map((item) => (
              <AssistiveTechCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* CLINICAL TRIALS */}
        <View style={styles.section}>
          <ThemedText type="heading">Clinical Trials</ThemedText>

          {liveLoading && (
            <ThemedText type="small">Loading live trials…</ThemedText>
          )}

          {liveError && (
            <ThemedText type="small">Error: {liveError}</ThemedText>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CLINICAL_TRIALS.map((item) => (
              <ClinicalTrialCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg },

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
    marginTop: Spacing.xl,
  },
});