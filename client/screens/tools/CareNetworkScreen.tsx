import React, { useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator,
  Share, KeyboardAvoidingView, Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  carer: "Carer",
  family: "Family",
  clinician: "Clinician",
};

const ROLE_ICONS: Record<string, string> = {
  carer: "heart",
  family: "users",
  clinician: "activity",
};

type Role = "carer" | "family" | "clinician";

export default function CareNetworkScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [relationships, setRelationships] = useState<{ asPatient: any[]; asCarer: any[] }>({
    asPatient: [], asCarer: [],
  });
  const [loading, setLoading] = useState(true);

  // Invite state
  const [selectedRole, setSelectedRole] = useState<Role>("carer");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Join state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/care/relationships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRelationships(await res.json());
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
      message: `I'd like to add you to my care network on Spinal Hub.\n\nYour invite code: ${generatedCode}\n\n1. Download Spinal Hub\n2. Create an account\n3. Go to Tools → Pressure Injury Tracker → Care Network\n4. Tap "Join with Code" and enter: ${generatedCode}\n\nCode expires ${codeExpiry}.`,
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

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl }}
        >
          {/* ── INVITE SECTION ── */}
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ADD SOMEONE TO YOUR CARE NETWORK
            </ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.6, marginBottom: Spacing.md }}>
              Choose their role, generate a code, and share it with them.
            </ThemedText>

            {/* Role picker */}
            <View style={styles.roleRow}>
              {(["carer", "family", "clinician"] as Role[]).map((role) => {
                const active = selectedRole === role;
                return (
                  <Pressable
                    key={role}
                    onPress={() => { setSelectedRole(role); setGeneratedCode(null); }}
                    style={[styles.roleCard, {
                      backgroundColor: active ? theme.primary + "22" : theme.backgroundSecondary,
                      borderColor: active ? theme.primary : theme.backgroundTertiary,
                      borderWidth: active ? 2 : 1,
                    }]}
                  >
                    <Feather name={ROLE_ICONS[role] as any} size={18} color={active ? theme.primary : theme.textSecondary} />
                    <ThemedText type="caption" style={{ fontWeight: active ? "700" : "400", marginTop: 4, color: active ? theme.primary : theme.text }}>
                      {ROLE_LABELS[role]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* Generate button */}
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

          {/* ── JOIN SECTION ── */}
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

          {/* ── MY NETWORK (as patient) ── */}
          {relationships.asPatient.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                PEOPLE WITH ACCESS TO YOUR DATA
              </ThemedText>
              {relationships.asPatient.map((rel) => (
                <View key={rel.id} style={[styles.personCard, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={[styles.personIcon, { backgroundColor: theme.primary + "22" }]}>
                    <Feather name={ROLE_ICONS[rel.role] as any ?? "user"} size={18} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>{rel.caregiver.name}</ThemedText>
                    <ThemedText type="caption" style={{ opacity: 0.5 }}>{ROLE_LABELS[rel.role] ?? rel.role}</ThemedText>
                  </View>
                  <Pressable onPress={() => revokeRelationship(rel.id, rel.caregiver.name)}>
                    <Feather name="x" size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* ── PATIENTS I SUPPORT ── */}
          {relationships.asCarer.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                PATIENTS I SUPPORT
              </ThemedText>
              {relationships.asCarer.map((rel) => (
                <View key={rel.id} style={[styles.personCard, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={[styles.personIcon, { backgroundColor: "#00E67622" }]}>
                    <Feather name="user" size={18} color="#00E676" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>{rel.patient.name}</ThemedText>
                    <ThemedText type="caption" style={{ opacity: 0.5 }}>
                      You are their {ROLE_LABELS[rel.role] ?? rel.role}
                    </ThemedText>
                  </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  personIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xl },
});
