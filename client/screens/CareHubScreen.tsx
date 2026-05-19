import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator,
  Share, KeyboardAvoidingView, Platform, Dimensions, Modal,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken, getUserIdFromToken } from "@/lib/auth";
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
  injuryType?: string | null;
  routineHighlights?: string | null;
  caregiverNotes?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medications?: string | null;
  allergies?: string | null;
};

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
  const route = useRoute<any>();

  React.useEffect(() => {
    if (route.params?.code) {
      setJoinCode((route.params.code as string).toUpperCase());
    }
  }, [route.params?.code]);

  const [mode, setMode] = useState<Mode>("patient");
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState<{ asPatient: Relationship[]; asCarer: Relationship[] }>({
    asPatient: [], asCarer: [],
  });
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<Record<string, { unreadNotes: number; criticalWounds: number; totalAlerts: number }>>({});

  // Patient dashboard state
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [jwtUserId, setJwtUserId] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Care intro modal
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introSaving, setIntroSaving] = useState(false);
  const [introAboutMe, setIntroAboutMe] = useState("");
  const [introInjuryLevel, setIntroInjuryLevel] = useState("");
  const [introInjuryType, setIntroInjuryType] = useState("");
  const [introRoutine, setIntroRoutine] = useState("");
  const [introCareNotes, setIntroCareNotes] = useState("");
  const [introEmergencyName, setIntroEmergencyName] = useState("");
  const [introEmergencyPhone, setIntroEmergencyPhone] = useState("");
  const [introMedications, setIntroMedications] = useState("");
  const [introAllergies, setIntroAllergies] = useState("");

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
      if (token) { const uid = getUserIdFromToken(token); if (uid) setJwtUserId(uid); }
      const headers = { Authorization: `Bearer ${token}` };

      const [relsRes, patientsRes, profileRes, alertsRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/care/relationships`, { headers }),
        fetch(`${getApiUrl()}/api/care/patients`, { headers }),
        fetch(`${getApiUrl()}/api/profile`, { headers }),
        fetch(`${getApiUrl()}/api/care/patients/alerts`, { headers }),
      ]);

      if (relsRes.ok) {
        const rels = await relsRes.json();
        setRelationships(rels);
        if (rels.asCarer.length > 0 && rels.asPatient.length === 0) {
          setMode("carer");
        }
      }
      if (patientsRes.ok) setPatients(await patientsRes.json());
      if (alertsRes.ok) {
        const arr: { patientId: string; unreadNotes: number; criticalWounds: number; totalAlerts: number }[] = await alertsRes.json();
        const map: Record<string, typeof arr[0]> = {};
        for (const a of arr) map[a.patientId] = a;
        setPatientAlerts(map);
      }

      if (profileRes.ok) setMyProfile(await profileRes.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function openIntroModal() {
    setIntroAboutMe(myProfile?.aboutMe ?? "");
    setIntroInjuryLevel(myProfile?.injuryLevel ?? "");
    setIntroInjuryType(myProfile?.injuryType ?? "");
    setIntroRoutine(myProfile?.routineHighlights ?? "");
    setIntroCareNotes(myProfile?.caregiverNotes ?? "");
    setIntroEmergencyName(myProfile?.emergencyContactName ?? "");
    setIntroEmergencyPhone(myProfile?.emergencyContactPhone ?? "");
    setIntroMedications(myProfile?.medications ?? "");
    setIntroAllergies(myProfile?.allergies ?? "");
    setIntroModalVisible(true);
  }

  async function saveIntro() {
    setIntroSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutMe: introAboutMe.trim() || null,
          injuryLevel: introInjuryLevel.trim() || null,
          injuryType: introInjuryType.trim() || null,
          routineHighlights: introRoutine.trim() || null,
          caregiverNotes: introCareNotes.trim() || null,
          emergencyContactName: introEmergencyName.trim() || null,
          emergencyContactPhone: introEmergencyPhone.trim() || null,
          medications: introMedications.trim() || null,
          allergies: introAllergies.trim() || null,
        }),
      });
      if (!res.ok) { Alert.alert("Save failed", "Could not save your care intro. Please try again."); return; }
      setIntroModalVisible(false);
      await load();
    } catch { Alert.alert("Network error", "Could not reach the server."); }
    finally { setIntroSaving(false); }
  }

  async function generateInvite() {
    setGenerating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/care/invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? `${res.status}`);
      setGeneratedCode(data.code);
      setCodeExpiry(new Date(data.expiresAt).toLocaleDateString("en-NZ", { day: "numeric", month: "long" }));
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not generate invite code.");
    } finally {
      setGenerating(false);
    }
  }

  async function shareCode() {
    if (!generatedCode) return;
    const deepLink = `spinalhub://join/${generatedCode}`;
    await Share.share({
      message: `I'd like to add you to my care network on Spinal Hub.\n\nTap this link to join instantly:\n${deepLink}\n\nOr enter code manually: ${generatedCode}\n\nCode expires ${codeExpiry}.`,
      url: deepLink,
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
                    <ThemedText type="small" style={{ lineHeight: 20, opacity: 0.85 }} numberOfLines={4}>
                      {myProfile.aboutMe}
                    </ThemedText>
                  ) : (
                    <ThemedText type="small" style={{ opacity: 0.4, fontStyle: "italic" }}>
                      Add a short bio so new support workers know who you are.
                    </ThemedText>
                  )}
                  {(myProfile?.injuryLevel || myProfile?.injuryType) ? (
                    <View style={[styles.infoChip, { marginTop: Spacing.sm }]}>
                      <Feather name="activity" size={12} color={theme.textSecondary} />
                      <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>
                        {[myProfile.injuryLevel, myProfile.injuryType].filter(Boolean).join(" · ")}
                      </ThemedText>
                    </View>
                  ) : null}
                  {myProfile?.caregiverNotes ? (
                    <View style={[styles.infoChip, { marginTop: Spacing.xs, alignItems: "flex-start" }]}>
                      <Feather name="alert-circle" size={12} color="#f97316" style={{ marginTop: 2 }} />
                      <ThemedText type="caption" style={{ opacity: 0.75, marginLeft: 4, flex: 1 }} numberOfLines={3}>
                        {myProfile.caregiverNotes}
                      </ThemedText>
                    </View>
                  ) : null}
                  {myProfile?.emergencyContactName ? (
                    <View style={[styles.infoChip, { marginTop: Spacing.xs }]}>
                      <Feather name="phone" size={12} color={theme.textSecondary} />
                      <ThemedText type="caption" style={{ opacity: 0.7, marginLeft: 4 }}>
                        {myProfile.emergencyContactName}{myProfile.emergencyContactPhone ? `  ·  ${myProfile.emergencyContactPhone}` : ""}
                      </ThemedText>
                    </View>
                  ) : null}
                  {myProfile?.routineHighlights ? (
                    <ThemedText type="caption" style={{ opacity: 0.55, marginTop: Spacing.sm }} numberOfLines={2}>
                      {myProfile.routineHighlights}
                    </ThemedText>
                  ) : null}
                  <Pressable
                    onPress={openIntroModal}
                    style={({ pressed }) => [styles.editIntroBtn, { borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Feather name="edit-2" size={13} color={theme.textSecondary} />
                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 5, fontWeight: "600" }}>
                      Edit Intro
                    </ThemedText>
                  </Pressable>
                </ElevatedCard>
              </View>

              {/* ── B: HANDOVER LOG ── */}
              {myProfile?.userId ? (
                <View style={styles.section}>
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
                        <ThemedText type="small" style={{ fontWeight: "600" }}>Handover Log</ThemedText>
                        <ThemedText type="caption" style={{ opacity: 0.5, marginTop: 1 }}>Read & add care notes</ThemedText>
                      </View>
                      <Feather name="chevron-right" size={18} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                    </ElevatedCard>
                  </Pressable>
                </View>
              ) : null}

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
                        <ThemedText type="caption" style={{ opacity: 0.5, marginBottom: Spacing.md }}>
                          Share this invite — expires {codeExpiry}
                        </ThemedText>

                        <View style={styles.qrRow}>
                          <View style={[styles.qrWrapper, { backgroundColor: "#fff", borderColor: theme.primary + "33" }]}>
                            <QRCode
                              value={`spinalhub://join/${generatedCode}`}
                              size={110}
                              color="#000"
                              backgroundColor="#fff"
                            />
                          </View>
                          <View style={styles.qrTextCol}>
                            <ThemedText type="caption" style={{ opacity: 0.5, marginBottom: 6 }}>Or enter manually</ThemedText>
                            <ThemedText style={{ fontSize: 20, fontWeight: "800", letterSpacing: 3, color: theme.primary }}>
                              {generatedCode}
                            </ThemedText>
                            <ThemedText type="caption" style={{ opacity: 0.4, marginTop: 4 }}>
                              Scan QR or share the link
                            </ThemedText>
                          </View>
                        </View>

                        <View style={[styles.codeActions, { width: "100%" }]}>
                          <Pressable onPress={shareCode} style={[styles.codeBtn, { backgroundColor: theme.primary, flex: 1 }]}>
                            <Feather name="share-2" size={14} color="#fff" />
                            <ThemedText type="caption" style={{ color: "#fff", fontWeight: "700", marginLeft: 6 }}>Share Link</ThemedText>
                          </Pressable>
                          <Pressable onPress={() => setGeneratedCode(null)} style={[styles.codeBtn, { backgroundColor: theme.backgroundTertiary }]}>
                            <ThemedText type="caption" style={{ fontWeight: "600" }}>New</ThemedText>
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
                        const patientScreens = ["VitalsLog", "MedicationTracker", "AppointmentScheduler", "BladderLog", "BowelLog", "PainJournal", "HydrationTracker", "MorningRoutine", "EveningRoutine", "SkinCheckLog", "CarePreferences", "RehabGoals"];
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

              {/* Org Report button */}
              {patients.length > 0 && (
                <View style={[styles.section, { paddingTop: 0 }]}>
                  <Pressable
                    onPress={() => navigation.navigate("OrgReport")}
                    style={({ pressed }) => [styles.orgReportBtn, { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Feather name="bar-chart-2" size={15} color={theme.primary} />
                    <ThemedText type="small" style={{ color: theme.primary, fontWeight: "700", marginLeft: 6 }}>
                      Organisation Report
                    </ThemedText>
                    <Feather name="chevron-right" size={15} color={theme.primary} style={{ marginLeft: "auto" }} />
                  </Pressable>
                </View>
              )}

              {/* Patient cards */}
              {loading ? (
                <ActivityIndicator style={{ marginTop: Spacing.xl }} color={theme.primary} />
              ) : patients.length > 0 ? (
                <View style={styles.section}>
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    YOUR PATIENTS
                  </ThemedText>
                  {[...patients].sort((a, b) => (patientAlerts[b.patientId]?.totalAlerts ?? 0) - (patientAlerts[a.patientId]?.totalAlerts ?? 0)).map((p) => {
                    const alerts = patientAlerts[p.patientId];
                    const hasCritical = (alerts?.criticalWounds ?? 0) > 0;
                    const hasUnread = (alerts?.unreadNotes ?? 0) > 0;
                    const totalAlerts = alerts?.totalAlerts ?? 0;
                    return (
                    <Pressable
                      key={p.patientId}
                      onPress={() => navigation.navigate("PatientDetail", {
                        patientId: p.patientId,
                        patientName: p.patientName,
                        role: p.role,
                      })}
                    >
                      <ElevatedCard style={StyleSheet.flatten([styles.patientCard, hasCritical ? { borderLeftWidth: 3, borderLeftColor: "#FF3B30" } : undefined])} padding={Spacing.md}>
                        <View style={styles.patientCardInner}>
                          {/* Avatar + total alert badge */}
                          <View style={{ position: "relative" }}>
                            <View style={[styles.patientAvatar, { backgroundColor: theme.primary + "22" }]}>
                              <ThemedText style={{ fontSize: 18, fontWeight: "800", color: theme.primary }}>
                                {p.patientName.charAt(0).toUpperCase()}
                              </ThemedText>
                            </View>
                            {totalAlerts > 0 && (
                              <View style={[styles.alertDot, { backgroundColor: hasCritical ? "#FF3B30" : "#FF9800" }]}>
                                <ThemedText style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>{totalAlerts}</ThemedText>
                              </View>
                            )}
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
                              {/* Critical wound badge */}
                              {hasCritical && (
                                <View style={[styles.badge, { backgroundColor: "#FF3B3022" }]}>
                                  <Feather name="alert-triangle" size={10} color="#FF3B30" />
                                  <ThemedText type="caption" style={{ color: "#FF3B30", fontWeight: "600", fontSize: 10, marginLeft: 3 }}>
                                    {alerts.criticalWounds} critical wound{alerts.criticalWounds !== 1 ? "s" : ""}
                                  </ThemedText>
                                </View>
                              )}
                              {/* Unread notes badge */}
                              {hasUnread && (
                                <View style={[styles.badge, { backgroundColor: "#FF980022" }]}>
                                  <Feather name="book-open" size={10} color="#FF9800" />
                                  <ThemedText type="caption" style={{ color: "#FF9800", fontWeight: "600", fontSize: 10, marginLeft: 3 }}>
                                    {alerts.unreadNotes} unread
                                  </ThemedText>
                                </View>
                              )}
                              {/* Wound count badge (non-critical) */}
                              {p.activeWoundCount > 0 && !hasCritical && (
                                <View style={[styles.badge, { backgroundColor: "#FF3B3022" }]}>
                                  <Feather name="alert-circle" size={10} color="#FF3B30" />
                                  <ThemedText type="caption" style={{ color: "#FF3B30", fontWeight: "600", fontSize: 10, marginLeft: 3 }}>
                                    {p.activeWoundCount} wound{p.activeWoundCount !== 1 ? "s" : ""}
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
                    );
                  })}
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

      {/* ── CARE INTRO EDIT MODAL ── */}
      <Modal visible={introModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIntroModalVisible(false)}>
        <View style={[introStyles.container, { backgroundColor: theme.backgroundRoot }]}>
          <View style={introStyles.header}>
            <Pressable onPress={() => setIntroModalVisible(false)}>
              <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
            <ThemedText style={introStyles.headerTitle}>My Care Intro</ThemedText>
            <Pressable onPress={saveIntro} disabled={introSaving}>
              <ThemedText style={{ color: introSaving ? theme.textSecondary : theme.primary, fontWeight: "700" }}>
                {introSaving ? "Saving…" : "Save"}
              </ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat contentContainerStyle={introStyles.scrollContent}>

            <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>ABOUT ME</ThemedText>
            <ThemedText style={[introStyles.hint, { color: theme.textSecondary }]}>Who you are, your personality, how long you've been injured</ThemedText>
            <TextInput
              value={introAboutMe}
              onChangeText={setIntroAboutMe}
              placeholder="e.g. I'm Dylan, T4 paraplegic since 2019. I'm independent with most tasks and like to do things my own way where possible..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[introStyles.textArea, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <View style={introStyles.row}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>INJURY LEVEL</ThemedText>
                <TextInput
                  value={introInjuryLevel}
                  onChangeText={setIntroInjuryLevel}
                  placeholder="e.g. T4"
                  placeholderTextColor={theme.textSecondary}
                  style={[introStyles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>COMPLETE / INCOMPLETE</ThemedText>
                <TextInput
                  value={introInjuryType}
                  onChangeText={setIntroInjuryType}
                  placeholder="e.g. Complete"
                  placeholderTextColor={theme.textSecondary}
                  style={[introStyles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                />
              </View>
            </View>

            <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>WHAT CARERS NEED TO KNOW</ThemedText>
            <ThemedText style={[introStyles.hint, { color: theme.textSecondary }]}>AD triggers, positioning needs, bowel/bladder routine summary, communication preferences, anything critical</ThemedText>
            <TextInput
              value={introCareNotes}
              onChangeText={setIntroCareNotes}
              placeholder="e.g. I get AD if my bladder is full — watch for flushing and headache. IC every 4 hours. Always offer me the call button before leaving the room..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[introStyles.textArea, { backgroundColor: theme.backgroundDefault, color: theme.text, minHeight: 110 }]}
            />

            <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>DAILY ROUTINE SUMMARY</ThemedText>
            <ThemedText style={[introStyles.hint, { color: theme.textSecondary }]}>Key points of your morning/evening routine for new workers</ThemedText>
            <TextInput
              value={introRoutine}
              onChangeText={setIntroRoutine}
              placeholder="e.g. Morning: shower first, then dress. I direct my own care. Evening: skin check before bed, turn at 2am..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[introStyles.textArea, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>KEY MEDICATIONS &amp; ALLERGIES</ThemedText>
            <ThemedText style={[introStyles.hint, { color: theme.textSecondary }]}>Summary only — use the Medications tile for the full list</ThemedText>
            <TextInput
              value={introMedications}
              onChangeText={setIntroMedications}
              placeholder="e.g. Baclofen 20mg TDS, Oxybutynin 5mg BD, Vitamin D daily"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[introStyles.textArea, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />
            <TextInput
              value={introAllergies}
              onChangeText={setIntroAllergies}
              placeholder="Allergies: e.g. Penicillin — anaphylaxis"
              placeholderTextColor={theme.textSecondary}
              style={[introStyles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />

            <ThemedText style={[introStyles.label, { color: theme.textSecondary }]}>EMERGENCY CONTACT</ThemedText>
            <TextInput
              value={introEmergencyName}
              onChangeText={setIntroEmergencyName}
              placeholder="Contact name & relationship"
              placeholderTextColor={theme.textSecondary}
              style={[introStyles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
            />
            <TextInput
              value={introEmergencyPhone}
              onChangeText={setIntroEmergencyPhone}
              placeholder="Phone number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              style={[introStyles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, marginTop: Spacing.sm }]}
            />

          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </ThemedView>
  );
}

const introStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 60 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4, marginTop: Spacing.lg },
  hint: { fontSize: 12, opacity: 0.6, marginBottom: Spacing.sm, lineHeight: 17 },
  input: { height: 48, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 15 },
  textArea: { borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 15, minHeight: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: Spacing.sm },
});

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
  codeBox: { borderRadius: BorderRadius.medium, padding: Spacing.lg, alignItems: "center", gap: Spacing.sm, width: "100%" },
  qrRow: { flexDirection: "row", alignItems: "center", gap: Spacing.lg, marginBottom: Spacing.sm, width: "100%" },
  qrWrapper: { borderRadius: 12, padding: 10, borderWidth: 1 },
  qrTextCol: { flex: 1 },
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
  alertDot: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },

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
  orgReportBtn: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
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
