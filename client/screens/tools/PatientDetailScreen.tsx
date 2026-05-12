import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert,
  Dimensions,
} from "react-native";

const TILE_WIDTH = (Dimensions.get("window").width - 48 - 16) / 3; // 3 cols, 24px padding each side, 8px * 2 gaps
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, "PatientDetail">;

// ---------------------------------------------------------------------------
// Tile config — role-based filtering applied at render time
// ---------------------------------------------------------------------------
type Tile = {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  screen?: keyof MainStackParamList;
  roles: string[]; // which roles see this tile
};

const TILES: Tile[] = [
  { id: "wounds",       icon: "shield",   label: "Pressure Injuries", sublabel: "Wounds, staging, checks", color: "#FF6B6B", screen: "PressureInjuryTracker", roles: ["carer", "clinician"] },
  { id: "vitals",       icon: "activity", label: "Vital Signs",       sublabel: "BP, HR, O₂, temp",        color: "#4A90D9", screen: "VitalsLog",             roles: ["carer", "clinician"] },
  { id: "bladder",      icon: "droplet",  label: "Bladder Log",       sublabel: "Output, catheter",        color: "#00BCD4", screen: "BladderLog",            roles: ["carer", "clinician"] },
  { id: "pain",         icon: "zap",      label: "Pain Journal",      sublabel: "Score, location",         color: "#FF7043", screen: "PainJournal",           roles: ["carer", "clinician"] },
  { id: "medications",  icon: "package",  label: "Medications",       sublabel: "Doses, times, PRN",       color: "#9C27B0", screen: "MedicationTracker",     roles: ["carer", "clinician"] },
  { id: "hydration",    icon: "droplet",  label: "Hydration",         sublabel: "Fluid intake",            color: "#29B6F6", screen: "HydrationTracker",      roles: ["carer", "clinician"] },
  { id: "skin",         icon: "eye",      label: "Skin Check",        sublabel: "Skin check log",          color: "#26A69A", screen: undefined,               roles: ["carer", "clinician"] },
  { id: "routine",      icon: "sun",      label: "Morning Routine",   sublabel: "ADLs, positioning",       color: "#FFC107", screen: "MorningRoutine",        roles: ["carer", "clinician", "family"] },
  { id: "evening",      icon: "moon",     label: "Evening Routine",   sublabel: "Skin, positioning",       color: "#5C6BC0", screen: "EveningRoutine",        roles: ["carer", "clinician", "family"] },
  { id: "appointments", icon: "calendar", label: "Appointments",      sublabel: "Upcoming, history",       color: "#FF9800", screen: "AppointmentScheduler",  roles: ["carer", "clinician", "family"] },
  { id: "care_prefs",   icon: "heart",    label: "Care Preferences",  sublabel: "Likes, dislikes, needs",  color: "#E91E63", screen: undefined,               roles: ["carer", "clinician", "family"] },
];

type Profile = {
  aboutMe?: string | null;
  injuryLevel?: string | null;
  injuryType?: string | null;
  injuryDate?: string | null;
  rehabCentre?: string | null;
  routineHighlights?: string | null;
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function PatientDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/care/profile/${encodeURIComponent(params.patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setProfile(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleTilePress(tile: Tile) {
    if (tile.screen) {
      navigation.navigate(tile.screen as any);
    } else {
      Alert.alert("Coming Soon", `${tile.label} will be available in a future update.`);
    }
  }

  const hasIntro = profile?.aboutMe || profile?.injuryLevel || profile?.routineHighlights;
  const visibleTiles = TILES.filter((t) => t.roles.includes(params.role));

  const roleColor = params.role === "clinician" ? "#AF52DE" : params.role === "family" ? "#5B8DEF" : "#00E676";

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: insets.bottom + Spacing.xl }}
      >
          {/* ── PATIENT HEADER ── */}
          <ElevatedCard style={styles.patientCard} padding={Spacing.md}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + "22" }]}>
              <ThemedText style={{ fontSize: 22, fontWeight: "800", color: theme.primary }}>
                {params.patientName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="h4">{params.patientName}</ThemedText>
              {profile?.injuryLevel ? (
                <ThemedText type="caption" style={{ opacity: 0.55, marginTop: 1 }}>
                  {[profile.injuryLevel, profile.injuryType].filter(Boolean).join(" · ")}
                </ThemedText>
              ) : null}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + "22" }]}>
              <ThemedText type="caption" style={{ color: roleColor, fontWeight: "700", fontSize: 11 }}>
                {params.role.charAt(0).toUpperCase() + params.role.slice(1)}
              </ThemedText>
            </View>
          </ElevatedCard>

          {/* ── PATIENT INTRO CARD ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#5B8DEF" }]} />
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                ABOUT THIS PATIENT
              </ThemedText>
            </View>

            {loading ? (
              <ActivityIndicator color={theme.primary} size="small" style={{ alignSelf: "flex-start" }} />
            ) : hasIntro ? (
              <ElevatedCard padding={Spacing.md}>
                {profile?.aboutMe ? (
                  <ThemedText type="small" style={{ lineHeight: 20, marginBottom: profile?.routineHighlights ? Spacing.md : 0 }}>
                    {profile.aboutMe}
                  </ThemedText>
                ) : null}

                {profile?.injuryDate || profile?.rehabCentre ? (
                  <View style={styles.infoRow}>
                    {profile.injuryDate ? (
                      <View style={styles.infoChip}>
                        <Feather name="calendar" size={12} color={theme.textSecondary} />
                        <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>
                          Injured {profile.injuryDate}
                        </ThemedText>
                      </View>
                    ) : null}
                    {profile.rehabCentre ? (
                      <View style={styles.infoChip}>
                        <Feather name="map-pin" size={12} color={theme.textSecondary} />
                        <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>
                          {profile.rehabCentre}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {profile?.routineHighlights ? (
                  <>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.routineHeader}>
                      <Feather name="sun" size={14} color="#FFC107" />
                      <ThemedText type="caption" style={{ fontWeight: "700", marginLeft: 6, color: "#FFC107" }}>
                        ROUTINE HIGHLIGHTS
                      </ThemedText>
                    </View>
                    <ThemedText type="small" style={{ lineHeight: 20, opacity: 0.85, marginTop: Spacing.xs }}>
                      {profile.routineHighlights}
                    </ThemedText>
                  </>
                ) : null}
              </ElevatedCard>
            ) : (
              <ThemedText type="caption" style={{ opacity: 0.4 }}>
                Patient hasn't filled in their intro yet.
              </ThemedText>
            )}
          </View>

          {/* ── HANDOVER NOTES ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#00E676" }]} />
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                HANDOVER NOTES
              </ThemedText>
            </View>
            <Pressable
              onPress={() => navigation.navigate("HandoverNotes", { patientId: params.patientId, patientName: params.patientName })}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <ElevatedCard style={styles.notesEntryRow} padding={Spacing.md}>
                <View style={[styles.notesEntryIcon, { backgroundColor: "#00E676" + "22" }]}>
                  <Feather name="book-open" size={20} color="#00E676" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>Open Handover Log</ThemedText>
                  <ThemedText type="caption" style={{ opacity: 0.5, marginTop: 1 }}>
                    Read entries and add notes day by day
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} style={{ opacity: 0.5 }} />
              </ElevatedCard>
            </Pressable>
          </View>

          {/* ── CARE TOOLS (role-filtered) ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#4A90D9" }]} />
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                CARE TOOLS
              </ThemedText>
            </View>

            <View style={styles.tileGrid}>
              {visibleTiles.map((tile) => (
                <Pressable
                  key={tile.id}
                  onPress={() => handleTilePress(tile)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, width: TILE_WIDTH }]}
                >
                  <ElevatedCard style={styles.tile} padding={10}>
                    <View style={[styles.tileIcon, { backgroundColor: tile.color + "22" }]}>
                      <Feather name={tile.icon as any} size={18} color={tile.color} />
                    </View>
                    <ThemedText
                      type="small"
                      numberOfLines={1}
                      style={{ fontWeight: "600", fontSize: 11, marginTop: 6, lineHeight: 14 }}
                    >
                      {tile.label}
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      numberOfLines={2}
                      style={{ opacity: 0.5, fontSize: 9, marginTop: 2, lineHeight: 12 }}
                    >
                      {tile.sublabel}
                    </ThemedText>
                    <View style={styles.comingSoonBadge}>
                      <ThemedText style={{ fontSize: 8, color: theme.textSecondary, opacity: 0.6 }}>SOON</ThemedText>
                    </View>
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
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
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
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, flex: 1 },
  sectionAction: { paddingVertical: 2, paddingHorizontal: 4 },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.sm },
  infoChip: { flexDirection: "row", alignItems: "center" },
  divider: { height: 1, marginVertical: Spacing.md },
  routineHeader: { flexDirection: "row", alignItems: "center" },
  notesEntryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  notesEntryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { position: "relative" },
  tileIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  comingSoonBadge: {
    position: "absolute",
    top: 8, right: 8,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
