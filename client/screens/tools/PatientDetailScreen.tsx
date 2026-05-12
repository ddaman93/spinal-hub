import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, TextInput,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { SITES, STAGE_LABELS, stageColor } from "./PressureInjuryTrackerScreen";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, "PatientDetail">;

// ---------------------------------------------------------------------------
// Dashboard tile config
// ---------------------------------------------------------------------------
type Tile = {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  screen?: keyof MainStackParamList;
  wired: boolean;
};

const TILES: Tile[] = [
  { id: "vitals",       icon: "activity",       label: "Vital Signs",        sublabel: "BP, HR, O₂, temp",          color: "#4A90D9", screen: "VitalsLog",           wired: false },
  { id: "bladder",      icon: "droplet",         label: "Bladder Log",         sublabel: "Output, catheter, continence", color: "#00BCD4", screen: "BladderLog",          wired: false },
  { id: "pain",         icon: "zap",             label: "Pain Journal",        sublabel: "Score, location, triggers",   color: "#FF7043", screen: "PainJournal",         wired: false },
  { id: "medications",  icon: "package",         label: "Medications",         sublabel: "Doses, times, PRN",           color: "#9C27B0", screen: "MedicationTracker",   wired: false },
  { id: "appointments", icon: "calendar",        label: "Appointments",        sublabel: "Upcoming, history",           color: "#FF9800", screen: "AppointmentScheduler",wired: false },
  { id: "routine",      icon: "sun",             label: "Morning Routine",     sublabel: "ADLs, positioning",          color: "#FFC107", screen: "MorningRoutine",      wired: false },
  { id: "evening",      icon: "moon",            label: "Evening Routine",     sublabel: "Skin check, positioning",     color: "#5C6BC0", screen: "EveningRoutine",      wired: false },
  { id: "skin",         icon: "eye",             label: "Skin Check",          sublabel: "SkinCheck log",              color: "#26A69A", screen: undefined,             wired: false },
  { id: "hydration",    icon: "droplet",         label: "Hydration",           sublabel: "Fluid intake tracker",       color: "#29B6F6", screen: "HydrationTracker",    wired: false },
  { id: "care_prefs",   icon: "heart",           label: "Care Preferences",    sublabel: "Likes, dislikes, needs",     color: "#E91E63", screen: undefined,             wired: false },
];

// ---------------------------------------------------------------------------
// Wound card
// ---------------------------------------------------------------------------
function WoundCard({ injury, onPress, theme }: { injury: any; onPress: () => void; theme: any }) {
  const site = SITES.find((s) => s.id === injury.site);
  const color = stageColor(injury.latestStage);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      <ElevatedCard style={styles.card} padding={0}>
        <View style={[styles.cardAccent, { backgroundColor: color }]} />
        <View style={styles.cardBody}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            {site?.label ?? injury.siteLabel ?? injury.site}
          </ThemedText>
          <ThemedText type="caption" style={{ opacity: 0.6, marginTop: 2 }}>
            {STAGE_LABELS[injury.latestStage] ?? "No assessment"}
            {injury.lastChecked ? `  ·  ${new Date(injury.lastChecked).toLocaleDateString()}` : ""}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={16} color={theme.textSecondary} style={{ marginRight: Spacing.md }} />
      </ElevatedCard>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function PatientDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [injuries, setInjuries] = useState<any[]>([]);
  const [loadingInjuries, setLoadingInjuries] = useState(true);
  const [carerNotes, setCarerNotes] = useState("");
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadingInjuries(true);
    try {
      const token = await getToken();
      const [injRes, profileRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/pressure-injuries?patientId=${encodeURIComponent(params.patientId)}`,
          { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${getApiUrl()}/api/profile/${encodeURIComponent(params.patientId)}`,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (injRes.ok) setInjuries(await injRes.json());
      if (profileRes.ok) {
        const p = await profileRes.json();
        setCarerNotes(p.caregiverNotes ?? "");
        setNotesDraft(p.caregiverNotes ?? "");
      }
    } catch {
      // silently fail
    } finally {
      setLoadingInjuries(false);
    }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function saveNotes() {
    setNotesSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/profile/${encodeURIComponent(params.patientId)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ caregiverNotes: notesDraft }),
      });
      if (!res.ok) throw new Error();
      setCarerNotes(notesDraft);
      setNotesEditing(false);
    } catch {
      Alert.alert("Error", "Could not save notes.");
    } finally {
      setNotesSaving(false);
    }
  }

  function handleTilePress(tile: Tile) {
    if (tile.screen) {
      navigation.navigate(tile.screen as any);
    } else {
      Alert.alert("Coming Soon", `${tile.label} will be available in a future update.`);
    }
  }

  const active = injuries.filter((i) => i.status === "active");

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* Patient header card */}
        <ElevatedCard style={styles.patientCard} padding={Spacing.md}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + "22" }]}>
            <Feather name="user" size={26} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4">{params.patientName}</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.5, marginTop: 2 }}>
              Your role: {params.role.charAt(0).toUpperCase() + params.role.slice(1)}
            </ThemedText>
          </View>
        </ElevatedCard>

        {/* ── PRESSURE INJURIES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#FF6B6B" }]} />
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              PRESSURE INJURIES
            </ThemedText>
            <Pressable
              onPress={() => navigation.navigate("PressureInjuryTracker" as any)}
              style={styles.sectionAction}
            >
              <ThemedText type="caption" style={{ color: theme.primary, fontWeight: "600" }}>View map</ThemedText>
            </Pressable>
          </View>

          {loadingInjuries ? (
            <ActivityIndicator color={theme.primary} style={{ alignSelf: "flex-start" }} />
          ) : active.length > 0 ? (
            active.map((injury) => (
              <WoundCard
                key={injury.id}
                injury={injury}
                theme={theme}
                onPress={() => navigation.navigate("PressureInjuryDetail", {
                  injuryId: injury.id, site: injury.site, siteLabel: injury.siteLabel,
                })}
              />
            ))
          ) : (
            <ThemedText type="caption" style={{ opacity: 0.4 }}>No active wounds.</ThemedText>
          )}
        </View>

        {/* ── CARER NOTES ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#00E676" }]} />
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              CARER NOTES
            </ThemedText>
            {!notesEditing && (
              <Pressable onPress={() => { setNotesDraft(carerNotes); setNotesEditing(true); }} style={styles.sectionAction}>
                <ThemedText type="caption" style={{ color: theme.primary, fontWeight: "600" }}>
                  {carerNotes ? "Edit" : "Add note"}
                </ThemedText>
              </Pressable>
            )}
          </View>

          {notesEditing ? (
            <View style={{ gap: Spacing.sm }}>
              <TextInput
                value={notesDraft}
                onChangeText={setNotesDraft}
                multiline
                autoFocus
                placeholder="Notes about care, observations, concerns..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.notesInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              />
              <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                <Pressable
                  onPress={saveNotes}
                  disabled={notesSaving}
                  style={[styles.notesBtn, { backgroundColor: theme.primary }]}
                >
                  <ThemedText type="small" style={{ color: "#fff", fontWeight: "600" }}>
                    {notesSaving ? "Saving…" : "Save"}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setNotesEditing(false)}
                  style={[styles.notesBtn, { backgroundColor: theme.backgroundTertiary }]}
                >
                  <ThemedText type="small">Cancel</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : carerNotes ? (
            <ThemedText type="small" style={{ opacity: 0.8, lineHeight: 20 }}>{carerNotes}</ThemedText>
          ) : (
            <ThemedText type="caption" style={{ opacity: 0.4 }}>No notes yet. Tap "Add note" to start.</ThemedText>
          )}
        </View>

        {/* ── CARE TOOLS GRID ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#4A90D9" }]} />
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              CARE TOOLS
            </ThemedText>
          </View>

          <View style={styles.tileGrid}>
            {TILES.map((tile) => (
              <Pressable
                key={tile.id}
                onPress={() => handleTilePress(tile)}
                style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, width: "47%" }]}
              >
              <ElevatedCard style={styles.tile} padding={Spacing.md}>
                <View style={[styles.tileIcon, { backgroundColor: tile.color + "22" }]}>
                  <Feather name={tile.icon as any} size={20} color={tile.color} />
                </View>
                <ThemedText type="small" style={{ fontWeight: "600", fontSize: 13, marginTop: Spacing.sm }}>
                  {tile.label}
                </ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.5, fontSize: 11, marginTop: 2 }}>
                  {tile.sublabel}
                </ThemedText>
                {!tile.wired && (
                  <View style={styles.comingSoonBadge}>
                    <ThemedText style={{ fontSize: 9, color: theme.textSecondary, opacity: 0.6 }}>SOON</ThemedText>
                  </View>
                )}
              </ElevatedCard>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 2,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
  },
  sectionAction: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  cardAccent: { width: 4, alignSelf: "stretch" },
  cardBody: { flex: 1, padding: Spacing.md },
  notesInput: {
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
  },
  notesBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    alignItems: "center",
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tile: {
    position: "relative",
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
