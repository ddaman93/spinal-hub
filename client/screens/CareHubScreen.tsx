import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator,
  Share, KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

function decodeTokenUserId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? payload?.sub ?? null;
  } catch { return null; }
}
import { MainStackParamList } from "@/types/navigation";
import { CARE_TILES } from "@/data/careTiles";

const TILE_WIDTH = (Dimensions.get("window").width - 48 - 16) / 3;

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Mode = "patient" | "carer";
type Role = "carer" | "family" | "clinician";

const ROLE_LABELS: Record<string, string> = {
  carer: "Carer",
  family: "Family",
  clinician: "Clinician",
};

const ROLE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  carer: "heart",
  family: "users",
  clinician: "activity",
};

const ROLE_COLORS: Record<string, string> = {
  carer: "#00E676",
  family: "#5B8DEF",
  clinician: "#AF52DE",
};

type PatientSummary = {
  relationshipId: string;
  patientId: string;
  patientName: string;
  injuryLevel: string | null;
  injuryType: string | null;
  aboutMe: string | null;
  activeWoundCount: number;
  role: string;
  linkedAt: string;
};

type MyProfile = {
  userId: string;
  name: string;
  aboutMe?: string | null;
  injuryLevel?: string | null;
  routineHighlights?: string | null;
};

type CareNote = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(dateStr).toLocaleDateString();
}

type Relationship = {
  id: string;
  role: string;
  caregiver?: { id: string; name: string; email: string };
  patient?: { id: string; name: string; email: string };
};

export default function CareHubScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [mode, setMode] = useState<Mode>("patient");
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState<{ asPatient: Relationship[]; asCarer: Relationship[] }>({
    asPatient: [], asCarer: [],
  });
  const [patients, setPatients] = useState<PatientSummary[]>([]);

  // Patient dashboard state
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [jwtUserId, setJwtUserId] = useState<string | null>(null);
  const [recentNotes, setRecentNotes] = useState<CareNote[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Invite state
  const [selectedRole, setSelectedRole] = useState<Role>("carer");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Join state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (token) { const uid = decodeTokenUserId(token); if (uid) setJwtUserId(uid); }
      const headers = { Authorization: `Bearer ${token}` };

      const [relsRes, patientsRes, profileRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/care/relationships`, { headers }),
        fetch(`${getApiUrl()}/api/care/patients`, { headers }),
        fetch(`${getApiUrl()}/api/profile`, { headers }),
      ]);

      if (relsRes.ok) {
        const rels = await relsRes.json();
        setRelationships(rels);
        if (rels.asCarer.length > 0 && rels.asPatient.length === 0) {
          setMode("carer");
        }
      }
      if (patientsRes.ok) setPatients(await patientsRes.json());

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setMyProfile(profile);
        // Fetch recent notes using own userId
        if (profile.userId) {
          const notesRes = await fetch(
            `${getApiUrl()}/api/care/notes/${encodeURIComponent(profile.userId)}`,
            { headers },
          );
          if (notesRes.ok) {
            const notes: CareNote[] = await notesRes.json();
            setRecentNotes(notes.slice(0, 3));
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function generateInvite() {
    setGenerating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/care/invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGeneratedCode(data.code);
      setCodeExpiry(new Date(data.expiresAt).toLocaleDateString("en-NZ", { day: "numeric", month: "long" }));
    } catch {
      Alert.alert("Error", "Could not generate invite code.");
    } finally {
      setGenerating(false);
    }
  }

  async function shareCode() {
    if (!generatedCode) return;
    await Share.share({
      message: `I'd like to add you to my care network on Spinal Hub.\n\nYour invite code: ${generatedCode}\n\n1. Download Spinal Hub\n2. Create an account\n3. Open the Care tab\n4. Tap "Join with Code" and enter: ${generatedCode}\n\nCode expires ${codeExpiry}.`,
    });
  }

  async function joinNetwork() {
    if (!joinCode.trim()) { Alert.alert("Enter a code", "Please enter an invite code."); return; }
    setJoining(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/care/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.message ?? "Invalid code."); return; }
      Alert.alert("Linked!", `You are now linked to ${data.patientName} as their ${ROLE_LABELS[data.role] ?? data.role}.`);
      setJoinCode("");
      load();
    } catch {
      Alert.alert("Error", "Could not join. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  async function revokeRelationship(id: string, name: string) {
    Alert.alert("Remove Access", `Remove ${name} from your care network?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/care/relationships/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          load();
        },
      },
    ]);
  }

  const isBoth = relationships.asPatient.length > 0 && relationships.asCarer.length > 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl }}
        >
          {/* ── MODE TOGGLE ── */}
          {isBoth && (
            <View style={[styles.toggleRow, { paddingTop: Spacing.lg }]}>
              {(["patient", "carer"] as Mode[]).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: mode === m ? theme.primary : theme.backgroundSecondary,
                      flex: 1,
                    },
                  ]}
                >
                  <Feather
                    name={m === "patient" ? "user" : "users"}
                    size={14}
                    color={mode === m ? "#fff" : theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: mode === m ? "#fff" : theme.textSecondary, fontWeight: "600", marginLeft: 6 }}
                  >
                    {m === "patient" ? "My Care Team" : "Patients I Support"}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}

          {/* ═══════════════ PATIENT MODE ═══════════════ */}
          {mode === "patient" && (
            <>
              {/* ── A: MY CARE INTRO ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: "#5B8DEF" }]} />
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    MY CARE INTRO
                  </ThemedText>
                </View>
                <ElevatedCard padding={Spacing.md}>
                  {myProfile?.aboutMe ? (
                    <ThemedText type="small" style={{ lineHeight: 20, opacity: 0.85 }} numberOfLines={3}>
                      {myProfile.aboutMe}
                    </ThemedText>
                  ) : (
                    <ThemedText type="small" style={{ opacity: 0.4, fontStyle: "italic" }}>
                      Add a short bio so new support workers know who you are.
                    </ThemedText>
                  )}
                  {myProfile?.injuryLevel ? (
                    <View style={[styles.infoChip, { marginTop: Spacing.sm }]}>
                      <Feather name="activity" size={12} color={theme.textSecondary} />
                      <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>
                        {myProfile.injuryLevel}
                      </ThemedText>
                    </View>
                  ) : null}
                  {myProfile?.routineHighlights ? (
                    <ThemedText type="caption" style={{ opacity: 0.55, marginTop: Spacing.sm }} numberOfLines={2}>
                      {myProfile.routineHighlights}
                    </ThemedText>
                  ) : null}
                  <Pressable
                    onPress={() => navigation.navigate("EditProfile" as any)}
                    style={({ pressed }) => [styles.editIntroBtn, { borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Feather name="edit-2" size={13} color={theme.textSecondary} />
                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 5, fontWeight: "600" }}>
                      Edit Intro
                    </ThemedText>
                  </Pressable>
                </ElevatedCard>
              </View>

              {/* ── B: RECENT ACTIVITY ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: "#00E676" }]} />
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    RECENT ACTIVITY
                  </ThemedText>
                </View>

                {loading ? (
                  <ActivityIndicator color={theme.primary} size="small" style={{ alignSelf: "flex-start" }} />
                ) : recentNotes.length > 0 ? (
                  <>
                    {recentNotes.map((note) => (
                      <View key={note.id} style={[styles.activityRow, { borderBottomColor: theme.border }]}>
                        <View style={[styles.noteAvatar, { backgroundColor: theme.primary + "22" }]}>
                          <ThemedText style={{ fontSize: 11, fontWeight: "800", color: theme.primary }}>
                            {note.authorName.charAt(0).toUpperCase()}
                          </ThemedText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <ThemedText type="small" style={{ fontWeight: "600" }}>{note.authorName}</ThemedText>
                            <ThemedText type="caption" style={{ opacity: 0.4 }}>{timeAgo(note.createdAt)}</ThemedText>
                          </View>
                          <ThemedText type="caption" style={{ opacity: 0.6, marginTop: 1 }} numberOfLines={1}>
                            {note.content}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <ThemedText type="caption" style={{ opacity: 0.4 }}>No notes yet. Be the first to add one.</ThemedText>
                )}

                {/* Open full log row */}
                {myProfile?.userId ? (
                  <Pressable
                    onPress={() => navigation.navigate("HandoverNotes", {
                      patientId: myProfile.userId,
                      patientName: myProfile.name ?? "My Care Log",
                    })}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <ElevatedCard style={styles.logEntryRow} padding={Spacing.md}>
                      <View style={[styles.logEntryIcon, { backgroundColor: "#00E676" + "22" }]}>
                        <Feather name="book-open" size={18} color="#00E676" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="small" style={{ fontWeight: "600" }}>Open Handover Log</ThemedText>
                        <ThemedText type="caption" style={{ opacity: 0.5, marginTop: 1 }}>Read & add notes</ThemedText>
                      </View>
                      <Feather name="chevron-right" size={18} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                    </ElevatedCard>
                  </Pressable>
                ) : null}
              </View>

              {/* ── C: MY CARE TEAM ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: "#5C6BC0" }]} />
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    MY CARE TEAM
                  </ThemedText>
                </View>

                {relationships.asPatient.length > 0 ? (
                  relationships.asPatient.map((rel) => (
                    <View key={rel.id} style={[styles.personCard, { backgroundColor: theme.backgroundSecondary }]}>
                      <View style={[styles.avatar, { backgroundColor: (ROLE_COLORS[rel.role] ?? theme.primary) + "22" }]}>
                        <Feather name={(ROLE_ICONS[rel.role] ?? "user") as any} size={18} color={ROLE_COLORS[rel.role] ?? theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="small" style={{ fontWeight: "600" }}>{rel.caregiver?.name}</ThemedText>
                        <ThemedText type="caption" style={{ opacity: 0.5 }}>{ROLE_LABELS[rel.role] ?? rel.role}</ThemedText>
                      </View>
                      <Pressable
                        onPress={() => revokeRelationship(rel.id, rel.caregiver?.name ?? "")}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
                      >
                        <Feather name="x" size={18} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <ThemedText type="caption" style={{ opacity: 0.4 }}>No one linked yet.</ThemedText>
                )}

                {/* Invite button */}
                <Pressable
                  onPress={() => setShowInviteForm((v) => !v)}
                  style={({ pressed }) => [styles.inviteToggleBtn, { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Feather name={showInviteForm ? "chevron-up" : "user-plus"} size={15} color={theme.primary} />
                  <ThemedText type="small" style={{ color: theme.primary, fontWeight: "700", marginLeft: 6 }}>
                    {showInviteForm ? "Hide" : "Invite someone"}
                  </ThemedText>
                </Pressable>

                {showInviteForm && (
                  <>
                    <View style={styles.roleRow}>
                      {(["carer", "family", "clinician"] as Role[]).map((role) => {
                        const active = selectedRole === role;
                        const color = ROLE_COLORS[role];
                        return (
                          <Pressable
                            key={role}
                            onPress={() => { setSelectedRole(role); setGeneratedCode(null); }}
                            style={[styles.roleCard, {
                              backgroundColor: active ? color + "22" : theme.backgroundSecondary,
                              borderColor: active ? color : theme.backgroundTertiary,
                              borderWidth: active ? 2 : 1,
                            }]}
                          >
                            <Feather name={ROLE_ICONS[role]} size={18} color={active ? color : theme.textSecondary} />
                            <ThemedText type="caption" style={{ fontWeight: active ? "700" : "400", marginTop: 4, color: active ? color : theme.text }}>
                              {ROLE_LABELS[role]}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>

                    {!generatedCode ? (
                      <Pressable
                        onPress={generateInvite}
                        disabled={generating}
                        style={[styles.generateBtn, { backgroundColor: theme.primary }]}
                      >
                        {generating
                          ? <ActivityIndicator color="#fff" size="small" />
                          : (
                            <>
                              <Feather name="link" size={16} color="#fff" />
                              <ThemedText type="small" style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>
                                Generate Invite Code
                              </ThemedText>
                            </>
                          )}
                      </Pressable>
                    ) : (
                      <View style={[styles.codeBox, { backgroundColor: theme.backgroundSecondary }]}>
                        <ThemedText type="caption" style={{ opacity: 0.5, marginBottom: 4 }}>
                          Share this code — expires {codeExpiry}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 32, fontWeight: "800", letterSpacing: 6, color: theme.primary }}>
                          {generatedCode}
                        </ThemedText>
                        <View style={styles.codeActions}>
                          <Pressable onPress={shareCode} style={[styles.codeBtn, { backgroundColor: theme.primary }]}>
                            <Feather name="share-2" size={14} color="#fff" />
                            <ThemedText type="caption" style={{ color: "#fff", fontWeight: "700", marginLeft: 6 }}>Share</ThemedText>
                          </Pressable>
                          <Pressable onPress={() => setGeneratedCode(null)} style={[styles.codeBtn, { backgroundColor: theme.backgroundTertiary }]}>
                            <ThemedText type="caption" style={{ fontWeight: "600" }}>New Code</ThemedText>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* ── D: MY HEALTH RECORDS ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: "#4A90D9" }]} />
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    MY HEALTH RECORDS
                  </ThemedText>
                </View>
                <View style={styles.tileGrid}>
                  {CARE_TILES.map((tile) => (
                    <Pressable
                      key={tile.id}
                      onPress={() => {
                        if (!tile.screen) { Alert.alert("Coming Soon", `${tile.label} will be available in a future update.`); return; }
                        const patientScreens = ["VitalsLog", "MedicationTracker", "AppointmentScheduler", "BladderLog", "PainJournal", "HydrationTracker", "MorningRoutine", "EveningRoutine", "SkinCheckLog", "CarePreferences"];
                        if (patientScreens.includes(tile.screen)) {
                          const pid = myProfile?.userId ?? jwtUserId;
                          if (!pid) { Alert.alert("Still loading", "Please wait a moment and try again."); return; }
                          navigation.navigate(tile.screen as any, { patientId: pid, patientName: myProfile?.name ?? "Me" });
                        } else {
                          navigation.navigate(tile.screen as any);
                        }
                      }}
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
                        {!tile.screen && (
                          <View style={styles.comingSoonBadge}>
                            <ThemedText style={{ fontSize: 8, color: theme.textSecondary, opacity: 0.6 }}>SOON</ThemedText>
                          </View>
                        )}
                      </ElevatedCard>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* ── Join someone else's network (secondary, at bottom) ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: theme.textSecondary }]} />
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    JOIN SOMEONE'S CARE NETWORK
                  </ThemedText>
                </View>
                <ThemedText type="caption" style={{ opacity: 0.5, marginBottom: Spacing.sm }}>
                  Enter a code someone shared with you to access their care data.
                </ThemedText>
                <View style={[styles.joinRow, { backgroundColor: theme.backgroundSecondary }]}>
                  <TextInput
                    value={joinCode}
                    onChangeText={(t) => setJoinCode(t.toUpperCase())}
                    placeholder="Enter code"
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="characters"
                    maxLength={8}
                    style={{ flex: 1, color: theme.text, fontSize: 20, fontWeight: "700", letterSpacing: 3 }}
                  />
                  <Pressable onPress={joinNetwork} disabled={joining} style={[styles.joinBtn, { backgroundColor: theme.primary }]}>
                    {joining ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="arrow-right" size={18} color="#fff" />}
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* ═══════════════ CARER MODE ═══════════════ */}
          {mode === "carer" && (
            <>
              {/* Join via code */}
              <View style={styles.section}>
                <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  JOIN A PATIENT'S CARE NETWORK
                </ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.6, marginBottom: Spacing.md }}>
                  Enter the invite code your patient shared with you.
                </ThemedText>
                <View style={[styles.joinRow, { backgroundColor: theme.backgroundSecondary }]}>
                  <TextInput
                    value={joinCode}
                    onChangeText={(t) => setJoinCode(t.toUpperCase())}
                    placeholder="Enter code"
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="characters"
                    maxLength={8}
                    style={{ flex: 1, color: theme.text, fontSize: 20, fontWeight: "700", letterSpacing: 3 }}
                  />
                  <Pressable onPress={joinNetwork} disabled={joining} style={[styles.joinBtn, { backgroundColor: theme.primary }]}>
                    {joining ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="arrow-right" size={18} color="#fff" />}
                  </Pressable>
                </View>
              </View>

              {/* Patient cards */}
              {loading ? (
                <ActivityIndicator style={{ marginTop: Spacing.xl }} color={theme.primary} />
              ) : patients.length > 0 ? (
                <View style={styles.section}>
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    YOUR PATIENTS
                  </ThemedText>
                  {patients.map((p) => (
                    <Pressable
                      key={p.patientId}
                      onPress={() => navigation.navigate("PatientDetail", {
                        patientId: p.patientId,
                        patientName: p.patientName,
                        role: p.role,
                      })}
                    >
                      <ElevatedCard style={styles.patientCard} padding={Spacing.md}>
                        <View style={styles.patientCardInner}>
                          {/* Avatar */}
                          <View style={[styles.patientAvatar, { backgroundColor: theme.primary + "22" }]}>
                            <ThemedText style={{ fontSize: 18, fontWeight: "800", color: theme.primary }}>
                              {p.patientName.charAt(0).toUpperCase()}
                            </ThemedText>
                          </View>

                          {/* Info */}
                          <View style={{ flex: 1 }}>
                            <ThemedText type="small" style={{ fontWeight: "700" }}>{p.patientName}</ThemedText>
                            {(p.injuryLevel || p.injuryType) ? (
                              <ThemedText type="caption" style={{ opacity: 0.6, marginTop: 1 }}>
                                {[p.injuryLevel, p.injuryType].filter(Boolean).join(" · ")}
                              </ThemedText>
                            ) : null}
                            <View style={styles.badgeRow}>
                              {/* Role badge */}
                              <View style={[styles.badge, { backgroundColor: (ROLE_COLORS[p.role] ?? theme.primary) + "22" }]}>
                                <ThemedText type="caption" style={{ color: ROLE_COLORS[p.role] ?? theme.primary, fontWeight: "600", fontSize: 10 }}>
                                  {ROLE_LABELS[p.role] ?? p.role}
                                </ThemedText>
                              </View>
                              {/* Wound count badge */}
                              {p.activeWoundCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: "#FF3B3022" }]}>
                                  <Feather name="alert-circle" size={10} color="#FF3B30" />
                                  <ThemedText type="caption" style={{ color: "#FF3B30", fontWeight: "600", fontSize: 10, marginLeft: 3 }}>
                                    {p.activeWoundCount} active {p.activeWoundCount === 1 ? "wound" : "wounds"}
                                  </ThemedText>
                                </View>
                              )}
                            </View>
                          </View>

                          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
                        </View>

                        {/* About me preview */}
                        {p.aboutMe ? (
                          <ThemedText
                            type="caption"
                            style={{ opacity: 0.55, marginTop: Spacing.sm, lineHeight: 18 }}
                            numberOfLines={2}
                          >
                            {p.aboutMe}
                          </ThemedText>
                        ) : null}
                      </ElevatedCard>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="user-plus" size={36} color={theme.primary} style={{ opacity: 0.3 }} />
                  <ThemedText type="caption" style={{ opacity: 0.4, marginTop: Spacing.sm, textAlign: "center" }}>
                    No patients linked yet.{"\n"}Ask your patient for their invite code.
                  </ThemedText>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row", gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  toggleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 10, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 2 },
  roleRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  roleCard: {
    flex: 1, padding: Spacing.md, borderRadius: BorderRadius.medium,
    alignItems: "center", gap: 4,
  },
  generateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: Spacing.md, borderRadius: BorderRadius.medium, gap: 6,
  },
  codeBox: { borderRadius: BorderRadius.medium, padding: Spacing.lg, alignItems: "center", gap: 8 },
  codeActions: { flexDirection: "row", gap: Spacing.sm, marginTop: 4 },
  codeBtn: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.small, gap: 4,
  },
  joinRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: BorderRadius.medium, paddingLeft: Spacing.md, overflow: "hidden",
  },
  joinBtn: { padding: Spacing.md, margin: 4, borderRadius: BorderRadius.small },
  personCard: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.medium,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xl },
  patientCard: { marginBottom: Spacing.sm },
  patientCardInner: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  patientAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },

  // Patient dashboard
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: 2 },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  infoChip: { flexDirection: "row", alignItems: "center" },
  editIntroBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.sm, paddingVertical: 6, marginTop: Spacing.sm,
  },
  activityRow: {
    flexDirection: "row", gap: Spacing.sm, paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noteAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  logEntryRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  logEntryIcon: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  inviteToggleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { position: "relative" },
  tileIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  comingSoonBadge: {
    position: "absolute", top: 8, right: 8,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
