import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Switch,
  Pressable,
  TextInput,
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
import { useTheme } from "@/hooks/useTheme";

type Props = NativeStackScreenProps<MainStackParamList, "ClinicalTrialsList">;

interface Trial {
  id: string;
  title: string;
  status: string;
  phase?: string;
  summary?: string;
  countries: string[];
  source: "clinicaltrials.gov" | "anzctr";
  url?: string;
  eligibilityText?: string;
}

const CACHE_KEY = "clinical_trials_full_v1";
const CACHE_TTL = 30 * 60 * 1000;

const COUNTRY_FILTERS = ["All", "NZ", "AU", "US", "UK", "Other"] as const;
const INJURY_FILTERS = [
  "All",
  "Tetraplegia",
  "Paraplegia",
  "Complete",
  "Incomplete",
] as const;

type CountryFilter = (typeof COUNTRY_FILTERS)[number];
type InjuryFilter = (typeof INJURY_FILTERS)[number];

const COUNTRY_MAP: Record<string, string[]> = {
  NZ: ["New Zealand"],
  AU: ["Australia"],
  US: ["United States"],
  UK: ["United Kingdom"],
};

const INJURY_KEYWORDS: Record<string, string[]> = {
  Tetraplegia: ["tetrapleg", "quadripleg", "cervical"],
  Paraplegia: ["parapleg", "thoracic", "lumbar"],
  Complete: ["complete injury", "ais a", "asia a", "asia grade a", "motor complete"],
  Incomplete: ["incomplete injury", "ais b", "ais c", "ais d", "asia b", "asia c", "asia d", "motor incomplete"],
};

function matchesInjury(trial: Trial, filter: InjuryFilter): boolean {
  if (filter === "All") return true;
  const text = [trial.title, trial.summary ?? "", trial.eligibilityText ?? ""]
    .join(" ")
    .toLowerCase();
  return INJURY_KEYWORDS[filter].some((kw) => text.includes(kw));
}

function matchesCountry(trial: Trial, filter: CountryFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Other") {
    const known = Object.values(COUNTRY_MAP).flat();
    return !trial.countries.some((c) => known.includes(c));
  }
  const targets = COUNTRY_MAP[filter] ?? [];
  return trial.countries.some((c) => targets.includes(c));
}

export default function ClinicalTrialsListScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [allTrials, setAllTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("All");
  const [injuryFilter, setInjuryFilter] = useState<InjuryFilter>("All");
  const [recruitingOnly, setRecruitingOnly] = useState(false);

  /* ───────── fetch ───────── */
  function mapStudy(s: any): Trial {
    const p = s.protocolSection;
    const locations: any[] = p.contactsLocationsModule?.locations ?? [];
    const countries = [
      ...new Set(locations.map((l: any) => l.country).filter(Boolean)),
    ] as string[];
    return {
      id: p.identificationModule.nctId,
      title: p.identificationModule.briefTitle ?? "Untitled trial",
      status: p.statusModule.overallStatus ?? "Unknown",
      phase: p.designModule?.phases?.[0],
      summary: p.descriptionModule?.briefSummary,
      countries,
      source: "clinicaltrials.gov",
      url: `https://clinicaltrials.gov/study/${p.identificationModule.nctId}`,
      eligibilityText: p.eligibilityModule?.eligibilityCriteria,
    };
  }

  async function fetchTrials(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const seen = new Set<string>();
      const merged: Trial[] = [];

      const queries = [
        "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&pageSize=200&sort=LastUpdatePostDate%3Adesc",
        "https://clinicaltrials.gov/api/v2/studies?query.term=tetraplegia&pageSize=200&sort=LastUpdatePostDate%3Adesc",
        "https://clinicaltrials.gov/api/v2/studies?query.term=paraplegia&pageSize=200&sort=LastUpdatePostDate%3Adesc",
        "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&query.locn=Australia&pageSize=200&sort=LastUpdatePostDate%3Adesc",
        "https://clinicaltrials.gov/api/v2/studies?query.term=spinal%20cord%20injury&query.locn=New%20Zealand&pageSize=200&sort=LastUpdatePostDate%3Adesc",
      ];

      const results = await Promise.allSettled(queries.map((url) => fetch(url)));

      for (const result of results) {
        if (result.status !== "fulfilled" || !result.value.ok) continue;
        const data = await result.value.json();
        for (const s of data.studies ?? []) {
          const id = s.protocolSection?.identificationModule?.nctId;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          merged.push(mapStudy(s));
        }
      }

      setAllTrials(merged);
      if (merged.length > 0) {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), trials: merged }),
        );
      }
    } catch (err) {
      console.error("Trials fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setAllTrials(parsed.trials);
            setLoading(false);
            return;
          }
        }
      } catch {
        // proceed to fetch
      }
      fetchTrials();
    }
    init();
  }, []);

  /* ───────── filtering ───────── */
  const filteredTrials = useMemo(() => {
    let list = allTrials;
    if (recruitingOnly) list = list.filter((t) => t.status === "RECRUITING");
    if (countryFilter !== "All") list = list.filter((t) => matchesCountry(t, countryFilter));
    if (injuryFilter !== "All") list = list.filter((t) => matchesInjury(t, injuryFilter));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.summary?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allTrials, recruitingOnly, countryFilter, injuryFilter, search]);

  /* ───────── pill row ───────── */
  function renderPills<T extends string>(
    options: readonly T[],
    value: T,
    onChange: (v: T) => void,
  ) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                styles.pill,
                { backgroundColor: theme.backgroundTertiary },
                active && { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText
                type="caption"
                style={active ? { color: "#fff", fontWeight: "600" } : undefined}
              >
                {opt}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTrials(true)}
            tintColor="#00C896"
          />
        }
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <ThemedText type="heading">Clinical Trials</ThemedText>
          <View style={styles.toggle}>
            <ThemedText type="small">Recruiting only</ThemedText>
            <Switch value={recruitingOnly} onValueChange={setRecruitingOnly} />
          </View>
        </View>

        {/* SEARCH */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search trials..."
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundTertiary,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
        />

        {/* COUNTRY */}
        <ThemedText type="caption" style={styles.filterLabel}>Country</ThemedText>
        {renderPills(COUNTRY_FILTERS, countryFilter, setCountryFilter)}

        {/* INJURY LEVEL */}
        <ThemedText type="caption" style={styles.filterLabel}>Injury Level</ThemedText>
        {renderPills(INJURY_FILTERS, injuryFilter, setInjuryFilter)}

        {/* COUNT */}
        <ThemedText type="caption" style={styles.resultCount}>
          {loading ? "Loading trials..." : `${filteredTrials.length} trial${filteredTrials.length !== 1 ? "s" : ""}`}
        </ThemedText>

        {/* EMPTY */}
        {!loading && filteredTrials.length === 0 && (
          <ThemedText type="small" style={{ opacity: 0.6 }}>
            No trials match your filters.
          </ThemedText>
        )}

        {/* GRID */}
        <View style={styles.grid}>
          {filteredTrials.map((trial) => (
            <View key={`${trial.source}-${trial.id}`} style={styles.gridItem}>
              <LiveClinicalTrialCard {...trial} variant="grid" />
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.lg },

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

  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    marginBottom: 2,
  },

  filterLabel: {
    opacity: 0.5,
    marginTop: Spacing.sm,
    marginBottom: 4,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  pillRow: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },

  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },

  resultCount: {
    opacity: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
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
