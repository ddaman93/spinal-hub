import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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
import { TourTarget } from "@/components/TourTarget";
import { useTour } from "@/context/TourContext";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getSciNews, type NewsArticle } from "@/services/newsService";
import { TECH_CATEGORIES } from "@/data/techCategories";
import { WHEELCHAIR_CATEGORIES } from "@/data/wheelchairCategories";
import { CATEGORIES } from "@/config/catalog";
import { useTheme } from "@/hooks/useTheme";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { PROFILE_STORAGE_KEY } from "@/screens/ProfileScreen";

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

/* ───────────────── fetch functions ───────────────── */

/* ───────────────── search index ───────────────── */

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  action: (nav: ReturnType<typeof useNavigation<NativeStackNavigationProp<MainStackParamList>>>) => void;
};

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Tech categories
  for (const cat of TECH_CATEGORIES) {
    items.push({
      id: `tech-${cat.id}`,
      title: cat.title,
      subtitle: cat.subtitle,
      section: "Assistive Technology",
      action: (nav) => nav.navigate("AllAssistiveTech", { categoryId: cat.id }),
    });
  }

  // Wheelchair categories
  for (const cat of WHEELCHAIR_CATEGORIES) {
    items.push({
      id: `wc-${cat.id}`,
      title: cat.title,
      subtitle: cat.subtitle,
      section: "Wheelchairs",
      action: (nav) => nav.navigate("AllWheelchairs"),
    });
  }

  // Tool categories and their tools (live in ToolsStack — requires cross-tab navigation)
  for (const cat of CATEGORIES) {
    items.push({
      id: `cat-${cat.id}`,
      title: cat.title,
      subtitle: cat.description ?? "",
      section: "Tools",
      action: (nav) => {
        if (cat.route) {
          (nav as any).navigate("ToolsTab", { screen: cat.route });
        } else {
          (nav as any).navigate("ToolsTab", { screen: "Tools" });
        }
      },
    });
    for (const tool of cat.tools) {
      if (tool.comingSoon || !tool.route) continue;
      items.push({
        id: `tool-${tool.id}`,
        title: tool.name,
        subtitle: tool.description,
        section: cat.title,
        action: (nav) => (nav as any).navigate("ToolsTab", { screen: tool.route }),
      });
    }
  }

  // Top-level screens
  items.push(
    {
      id: "sci-news",
      title: "SCI News",
      subtitle: "Latest spinal cord injury research",
      section: "Sections",
      action: (nav) => nav.navigate("SciNewsList"),
    },
    {
      id: "clinical-trials",
      title: "Clinical Trials",
      subtitle: "Live trials for SCI patients",
      section: "Sections",
      action: (nav) => nav.navigate("ClinicalTrialsList", {}),
    },
  );

  return items;
}

const SEARCH_INDEX = buildSearchIndex();

/* ───────────────── glass section component ───────────────── */

function GlassSection({
  title,
  onViewAll,
  children,
  isDark,
}: {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View style={styles.glassWrapper}>
      <BlurView
        intensity={isDark ? 18 : 40}
        tint={isDark ? "dark" : "light"}
        style={styles.glassBlur}
      >
        <View
          style={[
            styles.glassInner,
            {
              borderColor: isDark
                ? "rgba(0,230,100,0.13)"
                : "rgba(0,0,0,0.08)",
              backgroundColor: isDark
                ? "rgba(12,26,14,0.55)"
                : "rgba(255,255,255,0.6)",
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">{title}</ThemedText>
            {onViewAll && (
              <Pressable onPress={onViewAll} hitSlop={8}>
                <ThemedText style={styles.viewAll}>View all →</ThemedText>
              </Pressable>
            )}
          </View>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

/* ───────────────── screen ───────────────── */

export default function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const scrollProps = useScrollAwareHeader();
  const scrollRef = React.useRef<any>(null);
  const { registerScrollRef } = useTour();

  React.useEffect(() => {
    registerScrollRef("HomeTab", scrollRef);
  }, [registerScrollRef]);

  const [userName, setUserName] = useState("");
  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
        if (raw) {
          const profile = JSON.parse(raw);
          setUserName(profile.name ?? "");
        }
      });
    }, [])
  );

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [liveTrials, setLiveTrials] = useState<LiveTrial[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [searchQuery]);

  const { data: newsArticles = [] } = useQuery({
    queryKey: ["sciNews"],
    queryFn: getSciNews,
    staleTime: 30 * 60 * 1000,
  });

  const previewNews = useMemo(() => {
    const breakthroughs = newsArticles.filter((a) => a.category === "Breakthrough");
    const rest = newsArticles.filter((a) => a.category !== "Breakthrough");
    return [...breakthroughs, ...rest].slice(0, 5);
  }, [newsArticles]);

  /* ───────── weather ───────── */
  React.useEffect(() => {
    let cancelled = false;
    async function loadWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const res = await fetch(
          `${getApiUrl()}/api/weather?latitude=${latitude}&longitude=${longitude}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setWeather(data);
      } catch {}
    }
    loadWeather();
    return () => { cancelled = true; };
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
            if (Date.now() - parsed.timestamp < CACHE_TTL) return;
          }
          setLiveLoading(true);
          const res = await fetch(
            "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=20&sort=LastUpdatePostDate:desc",
          );
          const data = await res.json();
          const trials: LiveTrial[] = data.studies?.map((study: any) => {
            const protocol = study.protocolSection;
            return {
              id: protocol.identificationModule.nctId,
              title: protocol.identificationModule.briefTitle ?? "Untitled study",
              status: protocol.statusModule.overallStatus ?? "Unknown",
              phase: protocol.designModule?.phases?.[0],
              summary: protocol.descriptionModule?.briefSummary,
              country: protocol.contactsLocationsModule?.locations?.[0]?.country,
            };
          }) ?? [];
          if (active) setLiveTrials(trials);
          await AsyncStorage.setItem(
            TRIALS_CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), trials }),
          );
        } catch {
        } finally {
          if (active) setLiveLoading(false);
        }
      }
      loadTrials();
      return () => { active = false; };
    }, []),
  );

  /* ───────────────── render ───────────────── */

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* GREETING */}
        <View style={styles.topRow}>
          <View>
            <ThemedText type="heading">
              {getGreeting()}{userName ? `, ${userName}` : ""}
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              Welcome back to Spinal Hub
            </ThemedText>
          </View>

          {weather && (
            <View style={styles.weather}>
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
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

        {/* SEARCH */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.06)",
              borderColor: isDark
                ? "rgba(0,230,100,0.15)"
                : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <Feather
            name="search"
            size={16}
            color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Spinal Hub..."
            placeholderTextColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
            style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <View
            style={[
              styles.resultsContainer,
              {
                backgroundColor: isDark ? "#0C1A0E" : "#fff",
                borderColor: isDark ? "rgba(0,230,100,0.15)" : "rgba(0,0,0,0.08)",
              },
            ]}
          >
            {searchResults.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  item.action(navigation);
                  setSearchQuery("");
                }}
                style={({ pressed }) => [
                  styles.resultRow,
                  index < searchResults.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.06)",
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>
                    {item.title}
                  </ThemedText>
                  <ThemedText type="caption" style={{ opacity: 0.55 }} numberOfLines={1}>
                    {item.subtitle}
                  </ThemedText>
                </View>
                <ThemedText
                  type="caption"
                  style={[styles.resultSection, { color: isDark ? "#00E676" : "#123524" }]}
                >
                  {item.section}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* ASSISTIVE TECHNOLOGY */}
        <TourTarget stepId="assistive-tech" scrollRef={scrollRef}>
        <GlassSection
          title="Assistive Technology"
          isDark={isDark}
          onViewAll={() => navigation.navigate("AllAssistiveTech", { categoryId: "mobility" })}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.md, paddingTop: Spacing.xs }}
          >
            {TECH_CATEGORIES.map((category) => (
              <TechNavCard
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                image={category.image}
                onPress={() =>
                  navigation.navigate("AllAssistiveTech", { categoryId: category.id })
                }
              />
            ))}
          </ScrollView>
        </GlassSection>
        </TourTarget>

        {/* WHEELCHAIRS */}
        <TourTarget stepId="wheelchairs" scrollRef={scrollRef}>
        <GlassSection
          title="Wheelchairs"
          isDark={isDark}
          onViewAll={() => navigation.navigate("AllWheelchairs")}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.md, paddingTop: Spacing.xs }}
          >
            {WHEELCHAIR_CATEGORIES.map((category) => (
              <TechNavCard
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                image={category.image}
                onPress={() => navigation.navigate("AllWheelchairs")}
              />
            ))}
          </ScrollView>
        </GlassSection>
        </TourTarget>

        {/* SCI NEWS */}
        <TourTarget stepId="sci-news" scrollRef={scrollRef}>
        <GlassSection
          title="SCI News"
          isDark={isDark}
          onViewAll={() => navigation.navigate("SciNewsList")}
        >
          {previewNews.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.md, paddingTop: Spacing.xs }}
            >
              {previewNews.map((article) => (
                <SciNewsCard key={article.id} {...article} variant="carousel" />
              ))}
            </ScrollView>
          ) : (
            <ThemedText style={styles.placeholder}>
              Latest research and breakthroughs in spinal cord injury treatment.
            </ThemedText>
          )}
        </GlassSection>
        </TourTarget>

        {/* LIVE CLINICAL TRIALS */}
        <TourTarget stepId="clinical-trials" scrollRef={scrollRef}>
        <GlassSection
          title="Live Clinical Trials"
          isDark={isDark}
          onViewAll={() => navigation.navigate("ClinicalTrialsList", {})}
        >
          {!liveLoading && liveTrials.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.md, paddingTop: Spacing.xs }}
            >
              {liveTrials.map((trial) => (
                <LiveClinicalTrialCard
                  key={trial.id}
                  {...trial}
                  variant="carousel"
                />
              ))}
            </ScrollView>
          ) : !liveLoading ? (
            <ThemedText style={styles.placeholder}>
              Loading clinical trials...
            </ThemedText>
          ) : null}
        </GlassSection>
        </TourTarget>
      </Animated.ScrollView>
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
    marginBottom: Spacing.sm,
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  resultsContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },

  resultSection: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  glassWrapper: {
    borderRadius: 20,
    overflow: "hidden",
  },

  glassBlur: {
    borderRadius: 20,
  },

  glassInner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.md,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
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
