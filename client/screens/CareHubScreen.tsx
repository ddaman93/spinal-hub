import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator,
  Share, KeyboardAvoidingView, Platform,
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
import { MainStackParamList } from "@/types/navigation";

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
      const headers = { Authorization: `Bearer ${token}` };

      const [relsRes, patientsRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/care/relationships`, { headers }),
        fetch(`${getApiUrl()}/api/care/patients`, { headers }),
      ]);

      if (relsRes.ok) {
        const rels = await relsRes.json();
        setRelationships(rels);
        // Auto-switch to carer mode if only a carer
        if (rels.asCarer.length > 0 && rels.asPatient.length === 0) {
          setMode("carer");
        }
      }
      if (patientsRes.ok) setPatients(await patientsRes.json());
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
              {/* Invite section */}
              <View style={styles.section}>
                <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  ADD SOMEONE TO YOUR CARE NETWORK
                </ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.6, marginBottom: Spacing.md }}>
                  Choose their role, generate a code, and share it with them.
                </ThemedText>

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
              </View>

              {/* Join section */}
              <View style={styles.section}>
                <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  JOIN SOMEONE'S CARE NETWORK
                </ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.6, marginBottom: Spacing.md }}>
                  Enter the code they shared with you.
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

              {/* My care team */}
              {relationships.asPatient.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    PEOPLE WITH ACCESS TO YOUR DATA
                  </ThemedText>
                  {relationships.asPatient.map((rel) => (
                    <View key={rel.id} style={[styles.personCard, { backgroundColor: theme.backgroundSecondary }]}>
                      <View style={[styles.avatar, { backgroundColor: (ROLE_COLORS[rel.role] ?? theme.primary) + "22" }]}>
                        <Feather name={(ROLE_ICONS[rel.role] ?? "user") as any} size={18} color={ROLE_COLORS[rel.role] ?? theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="small" style={{ fontWeight: "600" }}>{rel.caregiver?.name}</ThemedText>
                        <ThemedText type="caption" style={{ opacity: 0.5 }}>{ROLE_LABELS[rel.role] ?? rel.role}</ThemedText>
                      </View>
                      <Pressable onPress={() => revokeRelationship(rel.id, rel.caregiver?.name ?? "")}>
                        <Feather name="x" size={18} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {!loading && relationships.asPatient.length === 0 && relationships.asCarer.length === 0 && (
                <View style={styles.emptyState}>
                  <Feather name="users" size={36} color={theme.primary} style={{ opacity: 0.3 }} />
                  <ThemedText type="caption" style={{ opacity: 0.4, marginTop: Spacing.sm, textAlign: "center" }}>
                    Your care network is empty.{"\n"}Generate a code to invite someone.
                  </ThemedText>
                </View>
              )}
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
});
