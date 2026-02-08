import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LiveClinicalTrialCard } from "@/components/LiveClinicalTrialCard";
import { TechNavCard } from "@/components/TechNavCard";
import { SciNewsCard } from "@/components/SciNewsCard";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { TECH_CATEGORIES } from "@/data/techCategories";
import { WHEELCHAIR_CATEGORIES } from "@/data/wheelchairCategories";

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

type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
};

/* ───────────────── constants ───────────────── */

const TRIALS_CACHE_KEY = "clinical_trials_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24;

/* ───────────────── fetch functions ───────────────── */

async function fetchSciNews(): Promise<NewsArticle[]> {
  try {
    const baseUrl = getApiUrl();
    const response = await fetch(`${baseUrl}/api/sci-news`);

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const articles: NewsArticle[] = await response.json();
    return articles;
  } catch (error) {
    console.error("Error fetching SCI news:", error);
    throw error;
  }
}

/* ───────────────── screen ───────────────── */

export default function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const userName = "Dylan";

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [liveTrials, setLiveTrials] = useState<LiveTrial[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // Fetch news articles
  const { data: newsArticles = [] } = useQuery({
    queryKey: ["sciNews"],
    queryFn: fetchSciNews,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });

  // Select 5 random articles - shuffle on each dashboard visit
  const randomNews = useMemo(() => {
    if (newsArticles.length === 0) return [];
    const shuffled = [...newsArticles].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, [newsArticles]);

  /* ───────── weather ───────── */
  React.useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const baseUrl = getApiUrl();
        const url = `${baseUrl}/api/weather?latitude=${latitude}&longitude=${longitude}`;
        console.log("Fetching weather from:", url);

        const res = await fetch(url);
        if (!res.ok) {
          console.error("Weather API error:", res.status, res.statusText);
          return;
        }

        const data = await res.json();
        console.log("Weather data received:", data);

        if (!cancelled) {
          setWeather(data);
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
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
          const cached = await AsyncStorage.getItem(TRIALS_CACHE_KEY);

          if (cached) {
            const parsed = JSON.parse(cached);
            if (active) setLiveTrials(parsed.trials);

            if (Date.now() - parsed.timestamp < CACHE_TTL) {
              return;
            }
          }

          setLiveLoading(true);

          const res = await fetch(
            "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=20&sort=LastUpdatePostDate:desc",
          );

          const data = await res.json();

          const trials: LiveTrial[] =
            data.studies?.map((study: any) => {
              const protocol = study.protocolSection;

              return {
                id: protocol.identificationModule.nctId,
                title:
                  protocol.identificationModule.briefTitle ?? "Untitled study",
                status: protocol.statusModule.overallStatus ?? "Unknown",
                phase: protocol.designModule?.phases?.[0],
                summary: protocol.descriptionModule?.briefSummary,
                country:
                  protocol.contactsLocationsModule?.locations?.[0]?.country,
              };
            }) ?? [];

          if (active) setLiveTrials(trials);

          await AsyncStorage.setItem(
            TRIALS_CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              trials,
            }),
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
    }, []),
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
              <View>
                <ThemedText type="small">{weather.temp}°C</ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.7 }}>
                  {weather.city}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* ASSISTIVE TECHNOLOGY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">Assistive Technology</ThemedText>

            <Pressable
              onPress={() => navigation.navigate("AllAssistiveTech", {})}
            >
              <ThemedText style={styles.viewAll}>View all →</ThemedText>
            </Pressable>
          </View>

          {/* CATEGORY CARDS HORIZONTAL SCROLL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: Spacing.md,
            }}
          >
            {TECH_CATEGORIES.map((category) => (
              <TechNavCard
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                image={category.image}
                onPress={() =>
                  navigation.navigate("AllAssistiveTech", {
                    categoryId: category.id,
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* WHEELCHAIRS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">Wheelchairs</ThemedText>
          </View>

          {/* WHEELCHAIR CATEGORY CARDS HORIZONTAL SCROLL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: Spacing.md,
            }}
          >
            {WHEELCHAIR_CATEGORIES.map((category) => (
              <TechNavCard
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                image={category.image}
                onPress={() => {
                  // TODO: Navigate to wheelchair category detail
                  console.log("Navigate to:", category.id);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* SCI NEWS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">SCI News</ThemedText>

            <Pressable
              onPress={() => navigation.navigate("SciNewsList")}
            >
              <ThemedText style={styles.viewAll}>See all →</ThemedText>
            </Pressable>
          </View>

          {randomNews.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: Spacing.md,
              }}
            >
              {randomNews.map((article) => (
                <SciNewsCard
                  key={article.id}
                  {...article}
                  variant="carousel"
                />
              ))}
            </ScrollView>
          ) : (
            <ThemedText style={styles.placeholder}>
              Latest research and breakthroughs in spinal cord injury treatment.
            </ThemedText>
          )}
        </View>

        {/* LIVE CLINICAL TRIALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">Live Clinical Trials</ThemedText>

            <Pressable
              onPress={() =>
                navigation.navigate("ClinicalTrialsList", {
                  trials: liveTrials,
                })
              }
            >
              <ThemedText style={styles.viewAll}>View all →</ThemedText>
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

  placeholder: {
    fontSize: 14,
    opacity: 0.6,
  },
});
