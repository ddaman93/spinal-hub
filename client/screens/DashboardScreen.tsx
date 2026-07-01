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
import { LinearGradient } from "expo-linear-gradient";
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
import { getToken, getUserIdFromToken } from "@/lib/auth";
import { getSciNews } from "@/services/newsService";
import { TECH_CATEGORIES } from "@/data/techCategories";
import { getTodaysTip, SCI_TIPS } from "@/data/sciTips";
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
  const [communityUnread, setCommunityUnread] = useState(false);

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

  /* ───────── community unread ───────── */
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const CHANNEL_IDS = ["general", "equipment-tech", "care-companies", "transport", "health-wellness", "research-trials", "spinal-units", "acc"];
      (async () => {
        try {
          const raw = await AsyncStorage.getItem("chat_last_read_v1");
          const lastRead: Record<string, string> = raw ? JSON.parse(raw) : {};
          const base = getApiUrl();
          const results = await Promise.all(CHANNEL_IDS.map(async (id) => {
            try {
              const res = await fetch(`${base}/api/chat/${id}`);
              if (!res.ok) return false;
              const rows: Array<{ timestamp: string }> = await res.json();
              if (rows.length === 0) return false;
              const lastTs = rows[rows.length - 1].timestamp;
              const lr = lastRead[id];
              return !lr || new Date(lastTs).getTime() > new Date(lr).getTime();
            } catch { return false; }
          }));
          if (active) setCommunityUnread(results.some(Boolean));
        } catch {}
      })();
      return () => { active = false; };
    }, [])
  );

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

  const [currentTip, setCurrentTip] = useState(() => getTodaysTip());

  function refreshTip() {
    let next;
    do { next = SCI_TIPS[Math.floor(Math.random() * SCI_TIPS.length)]; } while (next.text === currentTip.text);
    setCurrentTip(next);
  }

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
    (navigation as any).navigate(screen, withParams ? { patientId: pid, patientName: userName || "Me" } : undefined);
  }

  /* ───────────────── helpers ───────────────── */

  function IconCircle({ color, name, size = 22 }: { color: string; name: any; size?: number }) {
    return (
      <View style={[styles.iconCircle, { backgroundColor: color + (isDark ? "30" : "20"), borderColor: color + (isDark ? "50" : "35"), borderWidth: 1 }]}>
        <Feather name={name} size={size} color={color} />
      </View>
    );
  }

  function SectionCard({ title, accentColor, children, rightAction }: { title: string; accentColor: string; children: React.ReactNode; rightAction?: React.ReactNode }) {
    return (
      <View style={[styles.sectionCardOuter, {
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.18 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      }]}>
        <LinearGradient
          colors={isDark
            ? ["#161a16", "#131613"]
            : ["#ffffff", "#f9fcf9"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.sectionCardInner, { borderColor: isDark ? `${accentColor}22` : `${accentColor}18` }]}
        >
          <View style={[styles.sectionHeaderRow, { justifyContent: "space-between" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <View style={[styles.sectionDot, { backgroundColor: accentColor, shadowColor: accentColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6 }]} />
              <ThemedText style={[styles.sectionTitle, { color: accentColor }]}>{title}</ThemedText>
            </View>
            {rightAction}
          </View>
          {children}
        </LinearGradient>
      </View>
    );
  }

  /* ───────────────── render ───────────────── */

  return (
    <View style={styles.container}>
      {/* Full-screen background gradient */}
      <LinearGradient
        colors={isDark ? ["#0a0a0a", "#0c0e0c", "#0a0a0a"] : ["#f4f7f4", "#f8faf8", "#f4f7f4"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.ScrollView
        ref={scrollRef}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.sm, paddingBottom: insets.bottom + Spacing.xl, gap: Spacing.md }}
      >
        {/* ── HERO GREETING ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <View style={{ borderRadius: 24, shadowColor: accentGreen, shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.35 : 0.18, shadowRadius: 10, elevation: 5 }}>
          <LinearGradient
            colors={isDark ? ["#0a2414", "#0f2d1a", "#071810"] : ["#e8f5ec", "#f0faf2", "#f5fdf6"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Glow orbs */}
            <View style={[styles.heroOrb1, { backgroundColor: accentGreen }]} />
            <View style={[styles.heroOrb2, { backgroundColor: isDark ? "#00C853" : "#16A34A" }]} />

            {/* Top row: greeting left, weather right */}
            <View style={styles.heroTop}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.heroGreeting, { color: isDark ? "rgba(0,230,100,0.65)" : "rgba(22,163,74,0.65)" }]}>{getGreeting()}</ThemedText>
                <ThemedText style={[styles.heroName, { color: isDark ? "#fff" : "#0a1a0c" }]}>{userName || "Welcome"}</ThemedText>
                <ThemedText style={[styles.heroDate, { color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)" }]}>{new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" })}</ThemedText>
              </View>

              {/* Weather — right side, no box */}
              {weather ? (
                <View style={styles.weatherInline}>
                  <Image source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }} style={styles.weatherIcon} />
                  <ThemedText style={[styles.weatherTemp, { color: isDark ? "#fff" : "#0a1a0c" }]}>{weather.temp}°C</ThemedText>
                  <ThemedText style={[styles.weatherCity, { color: isDark ? "rgba(0,230,100,0.65)" : "rgba(22,163,74,0.7)" }]}>{weather.city}</ThemedText>
                </View>
              ) : null}
            </View>

            {/* Creator note */}
            <Pressable onPress={() => setCreatorNoteVisible(true)} style={({ pressed }) => [styles.creatorNoteInline, { opacity: pressed ? 0.7 : 1, borderColor: isDark ? "rgba(0,230,100,0.3)" : "rgba(18,53,36,0.2)" }]}>
              <Feather name="message-circle" size={11} color={accentGreen} />
              <ThemedText style={[styles.creatorNoteInlineText, { color: accentGreen }]}>Note from the creator</ThemedText>
            </Pressable>
          </LinearGradient>
          </View>
        </View>

        {/* SEARCH */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <View style={[styles.searchContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", borderColor: isDark ? "rgba(0,230,100,0.15)" : "rgba(0,0,0,0.08)" }]}>
            <Feather name="search" size={16} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"} style={{ marginRight: 8 }} />
            <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search Spinal Hub..." placeholderTextColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"} style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]} returnKeyType="search" clearButtonMode="while-editing" />
          </View>
        </View>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg }}>
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
          </View>
        )}

        {/* ── YOUR DAY ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SectionCard title="Your Day" accentColor={accentGreen}>
            <View style={styles.tileRow}>

              {/* Vitals */}
              <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigateTile("VitalsLog")}>
                <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.tileGradient, { borderColor: isDark ? "#EF444430" : "#EF444420" }]}>
                  <IconCircle color="#EF4444" name="heart" size={20} />
                  <ThemedText style={styles.tileLabel}>Vitals</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: "#EF4444" }]} numberOfLines={1}>
                    {latestVitalAt === null ? "--" : latestVitalAt === "" ? "None" : minsAgo(latestVitalAt)}
                  </ThemedText>
                </LinearGradient>
              </Pressable>

              {/* Meds */}
              <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigateTile("MedicationTracker")}>
                <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.tileGradient, { borderColor: isDark ? "#8B5CF630" : "#8B5CF620" }]}>
                  <IconCircle color="#8B5CF6" name="activity" size={20} />
                  <ThemedText style={styles.tileLabel}>Meds</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: medsTaken !== null && medsTotal !== null && medsTaken >= medsTotal && medsTotal > 0 ? accentGreen : "#8B5CF6" }]} numberOfLines={1}>
                    {medsTaken === null || medsTotal === null ? "--" : `${medsTaken}/${medsTotal}`}
                  </ThemedText>
                </LinearGradient>
              </Pressable>

              {/* Pressure Relief */}
              <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigateTile("PressureReliefTimer", false)}>
                <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.tileGradient, { borderColor: prOverdue ? (isDark ? "#F59E0B30" : "#F59E0B20") : (isDark ? "#00E67630" : "#16A34A20") }]}>
                  <IconCircle color={prOverdue ? "#F59E0B" : accentGreen} name="clock" size={20} />
                  <ThemedText style={styles.tileLabel}>Relief</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: prOverdue ? "#F59E0B" : accentGreen }]} numberOfLines={1}>
                    {prLabel}
                  </ThemedText>
                </LinearGradient>
              </Pressable>

              {/* Hydration */}
              <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigateTile("HydrationTracker")}>
                <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.tileGradient, { borderColor: isDark ? "#3B82F630" : "#3B82F620" }]}>
                  <IconCircle color="#3B82F6" name="droplet" size={20} />
                  <ThemedText style={styles.tileLabel}>Water</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: "#3B82F6" }]} numberOfLines={1}>
                    {hydrationMl === null ? "--" : `${hydrationMl}ml`}
                  </ThemedText>
                </LinearGradient>
              </Pressable>

              {/* FES Bike */}
              <Pressable style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigateTile("FesBike", false)}>
                <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.tileGradient, { borderColor: isDark ? "#10b98130" : "#10b98120" }]}>
                  <IconCircle color="#10b981" name="zap" size={20} />
                  <ThemedText style={styles.tileLabel}>FES Bike</ThemedText>
                  <ThemedText style={[styles.tileValue, { color: "#10b981" }]} numberOfLines={1}>Track</ThemedText>
                </LinearGradient>
              </Pressable>

            </View>
          </SectionCard>
        </View>

        {/* NEXT APPOINTMENT */}
        {nextAppt && (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <LinearGradient
              colors={isDark ? ["#0d1f2d", "#0a1620"] : ["#eff6ff", "#dbeafe"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.apptCard}
            >
              <View style={[styles.apptIconBox, { backgroundColor: "rgba(59,130,246,0.2)" }]}>
                <Feather name="calendar" size={20} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.apptLabel, { color: "#3B82F6" }]}>Next Appointment</ThemedText>
                <ThemedText style={[styles.apptName, { color: isDark ? "#fff" : "#0a1a0c" }]}>{nextAppt.clinicianName}</ThemedText>
                <ThemedText style={[styles.apptDate, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }]}>
                  {formatApptDate(nextAppt.date)}{nextAppt.time ? ` · ${nextAppt.time}` : ""}
                  {nextAppt.location ? `  ·  ${nextAppt.location}` : ""}
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── DISCOVER ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <TourTarget stepId="sci-news" scrollRef={scrollRef}>
            <SectionCard title="Discover" accentColor="#F59E0B">
              <View style={styles.tileRow}>

                {/* SCI News */}
                <Pressable style={({ pressed }) => [styles.discoverTile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigation.navigate("SciNewsList")}>
                  <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.discoverTileGradient, { borderColor: isDark ? "#F59E0B30" : "#F59E0B20" }]}>
                    <IconCircle color="#F59E0B" name="rss" size={20} />
                    <ThemedText style={styles.tileLabel}>SCI News</ThemedText>
                    <ThemedText style={[styles.discoverTileValue, { color: "#F59E0B" }]} numberOfLines={2}>
                      {featuredNews ? featuredNews.title : "Latest breakthroughs"}
                    </ThemedText>
                  </LinearGradient>
                </Pressable>

                {/* Clinical Trials */}
                <Pressable style={({ pressed }) => [styles.discoverTile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigation.navigate("ClinicalTrialsList", {})}>
                  <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.discoverTileGradient, { borderColor: isDark ? "#3B82F630" : "#3B82F620" }]}>
                    <IconCircle color="#3B82F6" name="zap" size={20} />
                    <ThemedText style={styles.tileLabel}>Clinical Trials</ThemedText>
                    <ThemedText style={[styles.discoverTileValue, { color: "#3B82F6" }]} numberOfLines={2}>
                      {featuredTrial ? featuredTrial.title : (liveLoading ? "Loading…" : "View live trials")}
                    </ThemedText>
                  </LinearGradient>
                </Pressable>

              </View>
            </SectionCard>
          </TourTarget>
        </View>

        {/* ── TIP OF THE DAY ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SectionCard
            title="Tip of the Day"
            accentColor="#EC4899"
            rightAction={
              <Pressable onPress={refreshTip} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                <Feather name="refresh-cw" size={14} color="#EC4899" />
              </Pressable>
            }
          >
            <View style={[styles.tipCard, { backgroundColor: isDark ? "rgba(236,72,153,0.06)" : "rgba(236,72,153,0.04)", borderColor: isDark ? "rgba(236,72,153,0.18)" : "rgba(236,72,153,0.12)" }]}>
              <View style={styles.tipHeader}>
                <IconCircle color="#EC4899" name="sun" size={18} />
                <ThemedText style={[styles.tipCategory, { color: "#EC4899" }]}>{currentTip.category}</ThemedText>
              </View>
              <ThemedText style={[styles.tipText, { color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.75)" }]}>{currentTip.text}</ThemedText>
            </View>
          </SectionCard>
        </View>

        {/* ── ASSISTIVE TECHNOLOGY ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <TourTarget stepId="assistive-tech" scrollRef={scrollRef}>
            <SectionCard title="Assistive Technology" accentColor="#06B6D4">
              <View style={styles.tileRow}>
                {TECH_CATEGORIES.map((cat) => (
                  <Pressable key={cat.id} style={({ pressed }) => [styles.techTile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => navigation.navigate("AllAssistiveTech", { categoryId: cat.id })}>
                    <LinearGradient colors={isDark ? ["#1c201c", "#171b17"] : ["#ffffff", "#f5f8f5"]} style={[styles.techTileGradient, { borderColor: isDark ? "#06B6D430" : "#06B6D420" }]}>
                      <Image source={cat.image as any} style={styles.techTileImage} resizeMode="cover" />
                      <ThemedText style={[styles.techTileLabel, { color: isDark ? "#fff" : "#0a1a0c" }]} numberOfLines={2}>{cat.title}</ThemedText>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </SectionCard>
          </TourTarget>
        </View>

        {/* ── QUICK ACCESS ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SectionCard title="Quick Access" accentColor="#10B981">
            <View style={styles.tileRow}>
              <Pressable style={({ pressed }) => [styles.exploreTile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => (navigation as any).navigate("ToolsTab", { screen: "CommunityChat" })}>
                <LinearGradient colors={isDark ? ["#10B98110", "#10B98105"] : ["#10B9810a", "#10B98103"]} style={[styles.exploreTileGradient, { borderColor: isDark ? "#10B98128" : "#10B9811a" }]}>
                  <View>
                    <IconCircle color="#10B981" name="message-square" size={18} />
                    {communityUnread && (
                      <View style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: isDark ? "#0a0a0a" : "#ffffff" }} />
                    )}
                  </View>
                  <ThemedText style={[styles.tileLabel, { color: "#10B981" }]}>Community</ThemedText>
                  <ThemedText style={styles.exploreTilePreview}>{communityUnread ? "New messages" : "Chat rooms"}</ThemedText>
                </LinearGradient>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.exploreTile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => (navigation as any).navigate("ToolsTab", { screen: "MobilityTaxiList" })}>
                <LinearGradient colors={isDark ? ["#F59E0B10", "#F59E0B05"] : ["#F59E0B0a", "#F59E0B03"]} style={[styles.exploreTileGradient, { borderColor: isDark ? "#F59E0B28" : "#F59E0B1a" }]}>
                  <IconCircle color="#F59E0B" name="navigation" size={18} />
                  <ThemedText style={[styles.tileLabel, { color: "#F59E0B" }]}>Taxis</ThemedText>
                  <ThemedText style={styles.exploreTilePreview}>Accessible cabs</ThemedText>
                </LinearGradient>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.exploreTile, { opacity: pressed ? 0.72 : 1 }]} onPress={() => (navigation as any).navigate("ToolsTab", { screen: "AccessibleTransportMap" })}>
                <LinearGradient colors={isDark ? ["#EF444410", "#EF444405"] : ["#EF44440a", "#EF444403"]} style={[styles.exploreTileGradient, { borderColor: isDark ? "#EF444428" : "#EF44441a" }]}>
                  <IconCircle color="#EF4444" name="map" size={18} />
                  <ThemedText style={[styles.tileLabel, { color: "#EF4444" }]}>Transport</ThemedText>
                  <ThemedText style={styles.exploreTilePreview}>Accessible map</ThemedText>
                </LinearGradient>
              </Pressable>
            </View>
          </SectionCard>
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
    </View>
  );
}

/* ───────────────── styles ───────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  subtitle: { opacity: 0.7, marginTop: Spacing.xs },
  weather: { flexDirection: "row", alignItems: "center", gap: 4 },
  weatherIcon: { width: 36, height: 36 },

  // Hero card
  heroCard: { borderRadius: 24, padding: Spacing.md, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,200,80,0.18)" },
  heroOrb1: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -80, right: -50, opacity: 0.15 },
  heroOrb2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -40, left: 20, opacity: 0.1 },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  heroGreeting: { fontSize: 12, fontWeight: "600", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 },
  heroName: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, lineHeight: 30 },
  heroDate: { fontSize: 12, marginTop: 2 },
  weatherBadge: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center", gap: 2, minWidth: 70 },
  weatherInline: { alignItems: "center", gap: 0, paddingLeft: 4 },
  weatherTemp: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  weatherCity: { fontSize: 11, fontWeight: "500", letterSpacing: 0.3 },
  creatorNoteInline: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: Spacing.sm, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  creatorNoteInlineText: { fontSize: 11, fontWeight: "600" },

  // Icon circle
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  // Section card
  sectionCardOuter: { borderRadius: 22 },
  sectionCardInner: { borderRadius: 22, borderWidth: 1, padding: Spacing.md },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: Spacing.sm },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionAccentBar: { height: 3, borderRadius: 2, marginBottom: Spacing.sm, width: 28 },
  sectionTitle: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2 },

  // Appointment card
  apptCard: { borderRadius: 18, padding: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" },
  apptIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  apptLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  apptName: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  apptDate: { fontSize: 12, marginTop: 2 },
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
  tile: { flex: 1, flexBasis: 0, borderRadius: 16 },
  tileGradient: { borderRadius: 16, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 6, alignItems: "center", gap: 6 },
  tileLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, opacity: 0.75, textAlign: "center" },
  tileValue: { fontSize: 14, fontWeight: "800", textAlign: "center" },
  exploreTile: { flex: 1, flexBasis: 0, borderRadius: 16 },
  exploreTileGradient: { borderRadius: 16, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 4, alignItems: "center", gap: 5, flex: 1 },
  exploreTilePreview: { fontSize: 9, textAlign: "center", lineHeight: 12, opacity: 0.55 },
  discoverTile: { flex: 1, flexBasis: 0, borderRadius: 16 },
  discoverTileGradient: { borderRadius: 16, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 10, alignItems: "center", gap: 8, flex: 1 },
  discoverTileValue: { fontSize: 11, fontWeight: "600", textAlign: "center", lineHeight: 15 },
  tipCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  tipCategory: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  tipText: { fontSize: 14, lineHeight: 21, fontWeight: "400" },
  techTile: { flex: 1, flexBasis: 0, borderRadius: 14 },
  techTileGradient: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  techTileImage: { width: "100%", height: 60 },
  techTileLabel: { fontSize: 10, fontWeight: "700", textAlign: "center", lineHeight: 13, padding: 6 },
  creatorNoteBtnBlur: { borderRadius: 20, overflow: "hidden" },
  creatorNoteBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  creatorNoteBtnText: { fontWeight: "600" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.lg },
  modalCard: { borderRadius: 16, padding: Spacing.xl, width: "100%", maxWidth: 380 },
  modalBody: { lineHeight: 24, opacity: 0.85, marginBottom: Spacing.lg },
  modalClose: { alignSelf: "flex-end" },
});
