import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
  TextInput,
  Modal,
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
import { TourTarget } from "@/components/TourTarget";
import { useTour } from "@/context/TourContext";

import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken, getUserIdFromToken } from "@/lib/auth";
import { getSciNews } from "@/services/newsService";
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

function minsAgo(isoOrMs: string | number | null): string {
  if (!isoOrMs) return "--";
  const ms = typeof isoOrMs === "number" ? isoOrMs : new Date(isoOrMs).getTime();
  const diff = Math.floor((Date.now() - ms) / 60000);
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  return `${h}h ago`;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatApptDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
}

/* ───────────────── types ───────────────── */

type WeatherData = { temp: number; icon: string; city: string };
type LiveTrial = { id: string; title: string; status: string; phase?: string; summary?: string; country?: string };
type Appointment = { id: string; date: string; time: string; clinicianName: string; location?: string };

type PrTimerState = {
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  lastUpdatedAt: number;
};

/* ───────────────── constants ───────────────── */

const NOTE_TEXT = `Hi,

I built Spinal Hub because I know first-hand how overwhelming the SCI journey can be — and how hard it is to find the resources that actually help.

I'm a C4 complete tetraplegic. I spent time in rehabilitation at Burwood from September 2025 to February 2026. During that time, I was struck by how much was available — assistive technologies, clinical trials, adaptive equipment — and how little of it was being communicated to patients who needed it most.

This app is my attempt to change that. Whether you're newly injured or years into your journey, I hope Spinal Hub helps you discover what's out there — and gives you a little more control over your future.

— Dylan`;

const TRIALS_CACHE_KEY = "clinical_trials_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24;
const PR_TIMER_KEY = "pressureReliefTimerState";
const PR_WARN_MINS = 90;

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
  for (const cat of TECH_CATEGORIES) {
    items.push({ id: `tech-${cat.id}`, title: cat.title, subtitle: cat.subtitle, section: "Assistive Technology", action: (nav) => nav.navigate("AllAssistiveTech", { categoryId: cat.id }) });
  }
  for (const cat of WHEELCHAIR_CATEGORIES) {
    items.push({ id: `wc-${cat.id}`, title: cat.title, subtitle: cat.subtitle, section: "Wheelchairs", action: (nav) => nav.navigate("AllWheelchairs") });
  }
  for (const cat of CATEGORIES) {
    items.push({ id: `cat-${cat.id}`, title: cat.title, subtitle: cat.description ?? "", section: "Tools", action: (nav) => { if (cat.route) { (nav as any).navigate("ToolsTab", { screen: cat.route }); } else { (nav as any).navigate("ToolsTab", { screen: "Tools" }); } } });
    for (const tool of cat.tools) {
      if (tool.comingSoon || !tool.route) continue;
      items.push({ id: `tool-${tool.id}`, title: tool.name, subtitle: tool.description, section: cat.title, action: (nav) => (nav as any).navigate("ToolsTab", { screen: tool.route }) });
    }
  }
  items.push(
    { id: "sci-news", title: "SCI News", subtitle: "Latest spinal cord injury research", section: "Sections", action: (nav) => nav.navigate("SciNewsList") },
    { id: "clinical-trials", title: "Clinical Trials", subtitle: "Live trials for SCI patients", section: "Sections", action: (nav) => nav.navigate("ClinicalTrialsList", {}) },
  );
  return items;
}

const SEARCH_INDEX = buildSearchIndex();

/* ───────────────── glass section component ───────────────── */

function GlassSection({ title, onViewAll, children, isDark }: { title: string; onViewAll?: () => void; children: React.ReactNode; isDark: boolean }) {
  return (
    <View style={styles.glassWrapper}>
      <BlurView intensity={isDark ? 18 : 40} tint={isDark ? "dark" : "light"} style={styles.glassBlur}>
        <View style={[styles.glassInner, { borderColor: isDark ? "rgba(0,230,100,0.13)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "rgba(12,26,14,0.55)" : "rgba(255,255,255,0.6)" }]}>
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
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const scrollProps = useScrollAwareHeader();
  const scrollRef = React.useRef<any>(null);
  const { registerScrollRef } = useTour();

  React.useEffect(() => { registerScrollRef("HomeTab", scrollRef); }, [registerScrollRef]);

  const [creatorNoteVisible, setCreatorNoteVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Health summary state — "--" = loading/unknown
  const [medsTotal, setMedsTotal] = useState<number | null>(null);
  const [medsTaken, setMedsTaken] = useState<number | null>(null);
  const [latestVitalAt, setLatestVitalAt] = useState<string | null>(null);
  const [hydrationMl, setHydrationMl] = useState<number | null>(null);
  const [prLastRelief, setPrLastRelief] = useState<number | null>(null); // ms timestamp
  const [nextAppt, setNextAppt] = useState<Appointment | null | false>(null); // null=loading, false=none

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [liveTrials, setLiveTrials] = useState<LiveTrial[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ───────── username + userId ───────── */
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
        if (raw) {
          const profile = JSON.parse(raw);
          setUserName(profile.name ?? "");
        }
      });
      getToken().then((token) => {
        if (token) {
          const uid = getUserIdFromToken(token);
          setUserId(uid);
        }
      });
    }, [])
  );

  /* ───────── health summary ───────── */
  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadHealth() {
        const token = await getToken();
        const uid = token ? getUserIdFromToken(token) : null;
        if (!uid || !token) return;

        const base = getApiUrl();
        const today = todayStr();
        const headers = { Authorization: `Bearer ${token}` };

        // PR timer from AsyncStorage (no network needed)
        AsyncStorage.getItem(PR_TIMER_KEY).then((raw) => {
          if (!active) return;
          if (raw) {
            const s: PrTimerState = JSON.parse(raw);
            // If timer is running, compute effective last-relief time
            if (s.isRunning) {
              // last relief = when timer started, approximated by lastUpdatedAt - (duration - remaining)
              const elapsed = s.durationSeconds - s.remainingSeconds;
              const startedAt = s.lastUpdatedAt - elapsed * 1000;
              setPrLastRelief(startedAt);
            } else {
              // timer done/stopped — last relief was when it last updated at 0
              setPrLastRelief(s.lastUpdatedAt);
            }
          }
        });

        try {
          const [medsRes, logsRes, vitalsRes, hydrationRes, apptRes] = await Promise.allSettled([
            fetch(`${base}/api/health/medications?patientId=${uid}`, { headers }),
            fetch(`${base}/api/health/medication-logs?patientId=${uid}&date=${today}`, { headers }),
            fetch(`${base}/api/health/vitals?patientId=${uid}`, { headers }),
            fetch(`${base}/api/health/hydration-logs?patientId=${uid}&date=${today}`, { headers }),
            fetch(`${base}/api/health/appointments?patientId=${uid}`, { headers }),
          ]);

          if (!active) return;

          if (medsRes.status === "fulfilled" && medsRes.value.ok) {
            const meds = await medsRes.value.json();
            setMedsTotal(Array.isArray(meds) ? meds.length : 0);
          }
          if (logsRes.status === "fulfilled" && logsRes.value.ok) {
            const logs = await logsRes.value.json();
            setMedsTaken(Array.isArray(logs) ? logs.length : 0);
          }
          if (vitalsRes.status === "fulfilled" && vitalsRes.value.ok) {
            const vitals = await vitalsRes.value.json();
            if (Array.isArray(vitals) && vitals.length > 0) {
              setLatestVitalAt(vitals[0].recordedAt ?? vitals[0].createdAt ?? null);
            } else {
              setLatestVitalAt("");
            }
          }
          if (hydrationRes.status === "fulfilled" && hydrationRes.value.ok) {
            const logs = await hydrationRes.value.json();
            const total = Array.isArray(logs) ? logs.reduce((sum: number, l: any) => sum + (l.amountMl ?? 0), 0) : 0;
            setHydrationMl(total);
          }
          if (apptRes.status === "fulfilled" && apptRes.value.ok) {
            const appts: Appointment[] = await apptRes.value.json();
            const now = Date.now();
            const upcoming = Array.isArray(appts)
              ? appts
                  .filter((a) => new Date(a.date).getTime() > now - 86400000)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              : [];
            setNextAppt(upcoming[0] ?? false);
          } else {
            setNextAppt(false);
          }
        } catch {
          if (active) setNextAppt(false);
        }
      }
      loadHealth();
      return () => { active = false; };
    }, [])
  );

  /* ───────── weather ───────── */
  React.useEffect(() => {
    let cancelled = false;
    async function loadWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const res = await fetch(`${getApiUrl()}/api/weather?latitude=${latitude}&longitude=${longitude}`);
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
    useCallback(() => {
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
          const res = await fetch("https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=20&sort=LastUpdatePostDate:desc");
          const data = await res.json();
          const trials: LiveTrial[] = data.studies?.map((study: any) => {
            const protocol = study.protocolSection;
            return { id: protocol.identificationModule.nctId, title: protocol.identificationModule.briefTitle ?? "Untitled study", status: protocol.statusModule.overallStatus ?? "Unknown", phase: protocol.designModule?.phases?.[0], summary: protocol.descriptionModule?.briefSummary, country: protocol.contactsLocationsModule?.locations?.[0]?.country };
          }) ?? [];
          if (active) setLiveTrials(trials);
          await AsyncStorage.setItem(TRIALS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), trials }));
        } catch {
        } finally {
          if (active) setLiveLoading(false);
        }
      }
      loadTrials();
      return () => { active = false; };
    }, []),
  );

  const { data: newsArticles = [] } = useQuery({ queryKey: ["sciNews"], queryFn: getSciNews, staleTime: 30 * 60 * 1000 });
  const featuredNews = useMemo(() => {
    const breakthroughs = newsArticles.filter((a) => a.category === "Breakthrough");
    const rest = newsArticles.filter((a) => a.category !== "Breakthrough");
    return [...breakthroughs, ...rest][0] ?? null;
  }, [newsArticles]);
  const featuredTrial = liveTrials[0] ?? null;
  const featuredTech = TECH_CATEGORIES[0];

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.section.toLowerCase().includes(q)).slice(0, 12);
  }, [searchQuery]);

  /* ───────── tile helpers ───────── */
  const prMinsAgo = prLastRelief ? Math.floor((Date.now() - prLastRelief) / 60000) : null;
  const prLabel = prMinsAgo !== null ? (prMinsAgo < 60 ? `${prMinsAgo}m ago` : `${Math.floor(prMinsAgo / 60)}h ago`) : "--";
  const prOverdue = prMinsAgo !== null && prMinsAgo >= PR_WARN_MINS;

  const accentGreen = isDark ? "#00E676" : "#16A34A";

  function navigateTile(screen: string, withParams = true) {
    const pid = userId ?? "";
    (navigation as any).navigate("ToolsTab", {
      screen,
      params: withParams ? { patientId: pid, patientName: userName || "Me" } : undefined,
    });
  }

  /* ───────────────── render ───────────────── */

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.sm, paddingBottom: insets.bottom + Spacing.xl, paddingHorizontal: Spacing.lg, gap: Spacing.md }}
      >
        {/* CREATOR NOTE BUTTON */}
        <Pressable onPress={() => setCreatorNoteVisible(true)} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, alignSelf: "flex-start", marginBottom: Spacing.sm }]}>
          <BlurView intensity={isDark ? 22 : 50} tint={isDark ? "dark" : "light"} style={styles.creatorNoteBtnBlur}>
            <View style={[styles.creatorNoteBtn, { borderColor: isDark ? "rgba(0,230,100,0.45)" : "rgba(18,53,36,0.25)", backgroundColor: isDark ? "rgba(0,230,100,0.08)" : "rgba(18,53,36,0.06)" }]}>
              <Feather name="message-circle" size={12} color={isDark ? "#00E676" : "#123524"} />
              <ThemedText type="caption" style={[styles.creatorNoteBtnText, { color: isDark ? "#00E676" : "#123524" }]}>Note from the creator</ThemedText>
            </View>
          </BlurView>
        </Pressable>

        {/* GREETING */}
        <View style={styles.topRow}>
          <View>
            <ThemedText type="heading">{getGreeting()}{userName ? `, ${userName}` : ""}</ThemedText>
            <ThemedText type="small" style={styles.subtitle}>Welcome back to Spinal Hub</ThemedText>
          </View>
          {weather && (
            <View style={styles.weather}>
              <Image source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }} style={styles.weatherIcon} />
              <View>
                <ThemedText type="small">{weather.temp}°C</ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.7 }}>{weather.city}</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* SEARCH */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", borderColor: isDark ? "rgba(0,230,100,0.15)" : "rgba(0,0,0,0.08)" }]}>
          <Feather name="search" size={16} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"} style={{ marginRight: 8 }} />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search Spinal Hub..." placeholderTextColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"} style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]} returnKeyType="search" clearButtonMode="while-editing" />
        </View>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <View style={[styles.resultsContainer, { backgroundColor: isDark ? "#0C1A0E" : "#fff", borderColor: isDark ? "rgba(0,230,100,0.15)" : "rgba(0,0,0,0.08)" }]}>
            {searchResults.map((item, index) => (
              <Pressable key={item.id} onPress={() => { item.action(navigation); setSearchQuery(""); }} style={({ pressed }) => [styles.resultRow, index < searchResults.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }, pressed && { opacity: 0.6 }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>{item.title}</ThemedText>
                  <ThemedText type="caption" style={{ opacity: 0.55 }} numberOfLines={1}>{item.subtitle}</ThemedText>
                </View>
                <ThemedText type="caption" style={[styles.resultSection, { color: isDark ? "#00E676" : "#123524" }]}>{item.section}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* YOUR DAY TODAY */}
        <View style={styles.glassWrapper}>
          <BlurView intensity={isDark ? 18 : 40} tint={isDark ? "dark" : "light"} style={styles.glassBlur}>
            <View style={[styles.glassInner, { borderColor: isDark ? "rgba(0,230,100,0.13)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "rgba(12,26,14,0.55)" : "rgba(255,255,255,0.6)" }]}>
              <ThemedText type="heading" style={{ marginBottom: Spacing.md }}>Your Day</ThemedText>
              <View style={styles.tileRow}>

                {/* Vitals */}
                <Pressable style={({ pressed }) => [styles.tile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigateTile("VitalsLog")}>
                  <Feather name="heart" size={22} color="#EF4444" />
                  <ThemedText style={styles.tileLabel}>Vitals</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: isDark ? "#fff" : "#111" }]} numberOfLines={1}>
                    {latestVitalAt === null ? "--" : latestVitalAt === "" ? "No data" : minsAgo(latestVitalAt)}
                  </ThemedText>
                </Pressable>

                {/* Meds */}
                <Pressable style={({ pressed }) => [styles.tile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigateTile("MedicationTracker")}>
                  <Feather name="activity" size={22} color="#8B5CF6" />
                  <ThemedText style={styles.tileLabel}>Meds</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: medsTaken !== null && medsTotal !== null && medsTaken >= medsTotal && medsTotal > 0 ? "#16A34A" : isDark ? "#fff" : "#111" }]} numberOfLines={1}>
                    {medsTaken === null || medsTotal === null ? "--" : `${medsTaken} / ${medsTotal}`}
                  </ThemedText>
                </Pressable>

                {/* Pressure Relief */}
                <Pressable style={({ pressed }) => [styles.tile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigateTile("PressureReliefTimer", false)}>
                  <Feather name="clock" size={22} color={prOverdue ? "#F59E0B" : accentGreen} />
                  <ThemedText style={styles.tileLabel}>Relief</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: prOverdue ? "#F59E0B" : isDark ? "#fff" : "#111" }]} numberOfLines={1}>
                    {prLabel}
                  </ThemedText>
                </Pressable>

                {/* Hydration */}
                <Pressable style={({ pressed }) => [styles.tile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigateTile("HydrationTracker")}>
                  <Feather name="droplet" size={22} color="#3B82F6" />
                  <ThemedText style={styles.tileLabel}>Hydration</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: isDark ? "#fff" : "#111" }]} numberOfLines={1}>
                    {hydrationMl === null ? "--" : `${hydrationMl}ml`}
                  </ThemedText>
                </Pressable>

              </View>
            </View>
          </BlurView>
        </View>

        {/* NEXT APPOINTMENT */}
        {nextAppt && (
          <View style={[styles.glassWrapper]}>
            <BlurView intensity={isDark ? 18 : 40} tint={isDark ? "dark" : "light"} style={styles.glassBlur}>
              <View style={[styles.glassInner, { borderColor: isDark ? "rgba(0,230,100,0.13)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "rgba(12,26,14,0.55)" : "rgba(255,255,255,0.6)" }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.xs }}>
                  <Feather name="calendar" size={16} color={accentGreen} />
                  <ThemedText type="heading" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6, color: accentGreen }}>Next Appointment</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 16, fontWeight: "600", marginBottom: 2 }}>{nextAppt.clinicianName}</ThemedText>
                <ThemedText style={{ opacity: 0.7, fontSize: 14 }}>
                  {formatApptDate(nextAppt.date)}{nextAppt.time ? `, ${nextAppt.time}` : ""}
                  {nextAppt.location ? `  ·  ${nextAppt.location}` : ""}
                </ThemedText>
              </View>
            </BlurView>
          </View>
        )}

        {/* EXPLORE ROW — SCI News · Trials · Assistive Tech */}
        <TourTarget stepId="sci-news" scrollRef={scrollRef}>
        <View style={styles.glassWrapper}>
          <BlurView intensity={isDark ? 18 : 40} tint={isDark ? "dark" : "light"} style={styles.glassBlur}>
            <View style={[styles.glassInner, { borderColor: isDark ? "rgba(0,230,100,0.13)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "rgba(12,26,14,0.55)" : "rgba(255,255,255,0.6)" }]}>
              <ThemedText type="heading" style={{ marginBottom: Spacing.md }}>Explore</ThemedText>
              <View style={styles.tileRow}>

                <Pressable style={({ pressed }) => [styles.exploreTile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigation.navigate("SciNewsList")}>
                  <Feather name="rss" size={20} color="#F59E0B" />
                  <ThemedText style={styles.tileLabel}>SCI News</ThemedText>
                  {featuredNews ? (
                    <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }]} numberOfLines={2}>{featuredNews.title}</ThemedText>
                  ) : null}
                </Pressable>

                <Pressable style={({ pressed }) => [styles.exploreTile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigation.navigate("ClinicalTrialsList", {})}>
                  <Feather name="zap" size={20} color="#3B82F6" />
                  <ThemedText style={styles.tileLabel}>Trials</ThemedText>
                  {featuredTrial ? (
                    <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }]} numberOfLines={2}>{featuredTrial.title}</ThemedText>
                  ) : (
                    <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)" }]}>{liveLoading ? "Loading…" : "View all"}</ThemedText>
                  )}
                </Pressable>

                <Pressable style={({ pressed }) => [styles.exploreTile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => navigation.navigate("AllAssistiveTech", { categoryId: "mobility" })}>
                  <Feather name="cpu" size={20} color="#8B5CF6" />
                  <ThemedText style={styles.tileLabel}>Tech</ThemedText>
                  <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }]} numberOfLines={2}>{featuredTech.subtitle}</ThemedText>
                </Pressable>

              </View>
            </View>
          </BlurView>
        </View>
        </TourTarget>

        {/* QUICK ACCESS */}
        <View style={styles.glassWrapper}>
          <BlurView intensity={isDark ? 18 : 40} tint={isDark ? "dark" : "light"} style={styles.glassBlur}>
            <View style={[styles.glassInner, { borderColor: isDark ? "rgba(0,230,100,0.13)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "rgba(12,26,14,0.55)" : "rgba(255,255,255,0.6)" }]}>
              <ThemedText type="heading" style={{ marginBottom: Spacing.md }}>Quick Access</ThemedText>
              <View style={styles.tileRow}>

                <Pressable style={({ pressed }) => [styles.exploreTile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => (navigation as any).navigate("ToolsTab", { screen: "CommunityChat" })}>
                  <Feather name="message-square" size={20} color="#10B981" />
                  <ThemedText style={styles.tileLabel}>Community</ThemedText>
                  <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }]}>Chat rooms</ThemedText>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.exploreTile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => (navigation as any).navigate("ToolsTab", { screen: "MobilityTaxiList" })}>
                  <Feather name="navigation" size={20} color="#F59E0B" />
                  <ThemedText style={styles.tileLabel}>Taxis</ThemedText>
                  <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }]}>Accessible cabs</ThemedText>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.exploreTile, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", opacity: pressed ? 0.7 : 1 }]} onPress={() => (navigation as any).navigate("ToolsTab", { screen: "AccessibleTransportMap" })}>
                  <Feather name="map" size={20} color="#EF4444" />
                  <ThemedText style={styles.tileLabel}>Transport</ThemedText>
                  <ThemedText style={[styles.exploreTilePreview, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }]}>Accessible map</ThemedText>
                </Pressable>

              </View>
            </View>
          </BlurView>
        </View>

      </Animated.ScrollView>

      <Modal visible={creatorNoteVisible} transparent animationType="fade" onRequestClose={() => setCreatorNoteVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCreatorNoteVisible(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: isDark ? "#0f1f12" : "#fff" }]} onPress={() => {}}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>A note from me</ThemedText>
            <ThemedText type="body" style={styles.modalBody}>{NOTE_TEXT}</ThemedText>
            <Pressable onPress={() => setCreatorNoteVisible(false)} style={styles.modalClose}>
              <ThemedText type="small" style={{ opacity: 0.6 }}>Close</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

/* ───────────────── styles ───────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  subtitle: { opacity: 0.7, marginTop: Spacing.xs },
  weather: { flexDirection: "row", alignItems: "center", gap: 4 },
  weatherIcon: { width: 36, height: 36 },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  resultsContainer: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  resultRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: 12, gap: Spacing.sm },
  resultSection: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  glassWrapper: { borderRadius: 20, overflow: "hidden" },
  glassBlur: { borderRadius: 20 },
  glassInner: { borderRadius: 20, borderWidth: 1, padding: Spacing.md },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  viewAll: { fontSize: 14, fontWeight: "500", color: "#3AA6FF" },
  placeholder: { fontSize: 14, opacity: 0.6 },
  tileRow: { flexDirection: "row", gap: Spacing.sm },
  tile: { flex: 1, flexBasis: 0, borderRadius: 14, padding: Spacing.sm, alignItems: "center", gap: 4 },
  tileLabel: { fontSize: 11, opacity: 0.55, textAlign: "center" },
  tileValue: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  exploreTile: { flex: 1, flexBasis: 0, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4, alignItems: "center", gap: 3 },
  exploreTilePreview: { fontSize: 9, textAlign: "center", lineHeight: 12 },
  creatorNoteBtnBlur: { borderRadius: 20, overflow: "hidden" },
  creatorNoteBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  creatorNoteBtnText: { fontWeight: "600" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.lg },
  modalCard: { borderRadius: 16, padding: Spacing.xl, width: "100%", maxWidth: 380 },
  modalBody: { lineHeight: 24, opacity: 0.85, marginBottom: Spacing.lg },
  modalClose: { alignSelf: "flex-end" },
});
