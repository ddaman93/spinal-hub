import React, { useState, useCallback } from "react";
import {
  View, ScrollView, StyleSheet, ActivityIndicator, Pressable, Alert, TextInput, Modal,
} from "react-native";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ElevatedCard } from "@/components/ElevatedCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type Member = { id: string; userId: string; name: string; email: string; role: string };
type Patient = { id: string; patientId: string; name: string; email: string; status: string };
type OrgDetail = {
  id: string; name: string; type: string; myRole: string;
  members: Member[]; patients: Patient[];
};

async function api(path: string, opts?: RequestInit) {
  const token = await getToken();
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }
  return res.json();
}

type ModalKind = "invite_member" | "add_patient" | "assign" | null;

export default function OrgAdminScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const orgId: string = route.params?.orgId;
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalKind>(null);
  const [codeInput, setCodeInput] = useState("");
  const [memberRole, setMemberRole] = useState<"admin" | "staff">("staff");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [assignPatientId, setAssignPatientId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`/api/org/${orgId}`);
      setOrg(data);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isAdmin = org?.myRole === "owner" || org?.myRole === "admin";

  async function handleInviteMember() {
    setBusy(true);
    try {
      const data = await api(`/api/org/${orgId}/invite-member`, {
        method: "POST",
        body: JSON.stringify({ role: memberRole }),
      });
      setInviteCode(data.code);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddPatient() {
    if (!codeInput.trim()) return;
    setBusy(true);
    try {
      const data = await api(`/api/org/${orgId}/patients`, {
        method: "POST",
        body: JSON.stringify({ code: codeInput.trim() }),
      });
      Alert.alert("Added", data.message);
      setModal(null);
      setCodeInput("");
      load();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign() {
    if (!assignStaffId || !assignPatientId) return;
    setBusy(true);
    try {
      await api(`/api/org/${orgId}/assignments`, {
        method: "POST",
        body: JSON.stringify({ staffUserId: assignStaffId, patientId: assignPatientId }),
      });
      Alert.alert("Assigned", "Staff assigned to patient.");
      setModal(null);
      setAssignStaffId("");
      setAssignPatientId("");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveMember(member: Member) {
    Alert.alert(
      "Remove member",
      `Remove ${member.name} from this org?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove", style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/org/${orgId}/members/${member.id}`, { method: "DELETE" });
              load();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ],
    );
  }

  async function handleDischarge(patient: Patient) {
    Alert.alert(
      "Discharge patient",
      `Remove ${patient.name} from org roster?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discharge", style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/org/${orgId}/patients/${patient.patientId}`, { method: "DELETE" });
              load();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  if (!org) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl }}>
        <ThemedText type="caption" style={{ opacity: 0.4 }}>Organisation not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* ── ORG HEADER ── */}
        <View style={styles.section}>
          <ElevatedCard padding={Spacing.lg}>
            <View style={styles.row}>
              <View style={[styles.orgAvatar, { backgroundColor: theme.primary + "22" }]}>
                <Feather name="briefcase" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: "800", fontSize: 17 }}>{org.name}</ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.5, marginTop: 2 }}>
                  {org.type.replace("_", " ")} · your role: {org.myRole}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
              <View style={styles.statItem}>
                <ThemedText style={{ fontSize: 22, fontWeight: "800", color: theme.primary }}>{org.members.length}</ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.5 }}>Staff</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <ThemedText style={{ fontSize: 22, fontWeight: "800", color: theme.primary }}>{org.patients.length}</ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.5 }}>Patients</ThemedText>
              </View>
            </View>
          </ElevatedCard>
        </View>

        {/* ── STAFF ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>STAFF</ThemedText>
            {isAdmin && (
              <Pressable onPress={() => { setInviteCode(null); setModal("invite_member"); }} style={styles.addBtn}>
                <Feather name="user-plus" size={14} color={theme.primary} />
                <ThemedText style={{ color: theme.primary, fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Invite</ThemedText>
              </Pressable>
            )}
          </View>
          {org.members.length === 0 ? (
            <ThemedText type="caption" style={{ opacity: 0.35 }}>No staff yet.</ThemedText>
          ) : (
            org.members.map((m) => (
              <View key={m.id} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                <View style={[styles.avatar, { backgroundColor: theme.primary + "22" }]}>
                  <ThemedText style={{ fontWeight: "800", color: theme.primary, fontSize: 13 }}>
                    {m.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>{m.name}</ThemedText>
                  <ThemedText type="caption" style={{ opacity: 0.5 }}>{m.email} · {m.role}</ThemedText>
                </View>
                {isAdmin && m.role !== "owner" && (
                  <Pressable onPress={() => handleRemoveMember(m)} hitSlop={8}>
                    <Feather name="x" size={16} color={theme.textSecondary} style={{ opacity: 0.4 }} />
                  </Pressable>
                )}
              </View>
            ))
          )}
        </View>

        {/* ── PATIENTS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>PATIENTS</ThemedText>
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              {isAdmin && (
                <Pressable onPress={() => { setModal("assign"); }} style={styles.addBtn}>
                  <Feather name="link" size={14} color={theme.primary} />
                  <ThemedText style={{ color: theme.primary, fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Assign</ThemedText>
                </Pressable>
              )}
              <Pressable onPress={() => { setCodeInput(""); setModal("add_patient"); }} style={styles.addBtn}>
                <Feather name="user-plus" size={14} color={theme.primary} />
                <ThemedText style={{ color: theme.primary, fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Add</ThemedText>
              </Pressable>
            </View>
          </View>
          {org.patients.length === 0 ? (
            <ThemedText type="caption" style={{ opacity: 0.35 }}>No patients on roster.</ThemedText>
          ) : (
            org.patients.map((p) => (
              <View key={p.id} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                <View style={[styles.avatar, { backgroundColor: "#5B8DEF22" }]}>
                  <ThemedText style={{ fontWeight: "800", color: "#5B8DEF", fontSize: 13 }}>
                    {p.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>{p.name}</ThemedText>
                  <ThemedText type="caption" style={{ opacity: 0.5 }}>{p.email}</ThemedText>
                </View>
                {isAdmin && (
                  <Pressable onPress={() => handleDischarge(p)} hitSlop={8}>
                    <Feather name="log-out" size={15} color={theme.textSecondary} style={{ opacity: 0.4 }} />
                  </Pressable>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── INVITE MEMBER MODAL ── */}
      <Modal visible={modal === "invite_member"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ElevatedCard padding={Spacing.lg} style={styles.modalCard}>
            <ThemedText style={{ fontWeight: "800", fontSize: 16, marginBottom: Spacing.md }}>Invite Staff Member</ThemedText>

            {inviteCode ? (
              <>
                <ThemedText type="caption" style={{ opacity: 0.6, marginBottom: Spacing.sm }}>Share this code with the staff member. Expires in 7 days.</ThemedText>
                <View style={[styles.codeBox, { backgroundColor: theme.primary + "18", borderColor: theme.primary + "44" }]}>
                  <ThemedText style={{ fontSize: 28, fontWeight: "900", letterSpacing: 4, color: theme.primary }}>{inviteCode}</ThemedText>
                </View>
                <ThemedText type="caption" style={{ opacity: 0.45, marginTop: Spacing.sm, textAlign: "center" }}>
                  They join at {memberRole} level. Send via SMS or email.
                </ThemedText>
                <Pressable onPress={() => { setModal(null); setInviteCode(null); }}
                  style={[styles.actionBtn, { backgroundColor: theme.primary, marginTop: Spacing.lg }]}>
                  <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Done</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ThemedText type="caption" style={{ opacity: 0.55, marginBottom: Spacing.md }}>Choose what level of access the new staff member will have.</ThemedText>
                <View style={styles.roleRow}>
                  {(["staff", "admin"] as const).map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setMemberRole(r)}
                      style={[styles.roleChip, {
                        backgroundColor: memberRole === r ? theme.primary : theme.primary + "18",
                        borderColor: memberRole === r ? theme.primary : theme.border,
                      }]}
                    >
                      <ThemedText style={{ color: memberRole === r ? "#fff" : theme.text, fontWeight: "600", fontSize: 13 }}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
                <ThemedText type="caption" style={{ opacity: 0.4, marginTop: Spacing.sm }}>
                  {memberRole === "admin" ? "Can manage staff, patients, and assignments." : "Can view and log for assigned patients."}
                </ThemedText>
                <View style={[styles.btnRow, { marginTop: Spacing.lg }]}>
                  <Pressable onPress={() => setModal(null)} style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
                    <ThemedText style={{ fontWeight: "600" }}>Cancel</ThemedText>
                  </Pressable>
                  <Pressable onPress={handleInviteMember} disabled={busy} style={[styles.actionBtn, { backgroundColor: theme.primary, flex: 1 }]}>
                    {busy ? <ActivityIndicator color="#fff" size="small" /> : <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Generate Code</ThemedText>}
                  </Pressable>
                </View>
              </>
            )}
          </ElevatedCard>
        </View>
      </Modal>

      {/* ── ADD PATIENT MODAL ── */}
      <Modal visible={modal === "add_patient"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ElevatedCard padding={Spacing.lg} style={styles.modalCard}>
            <ThemedText style={{ fontWeight: "800", fontSize: 16, marginBottom: Spacing.md }}>Add Patient to Roster</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.55, marginBottom: Spacing.md }}>
              Ask the patient to generate an invite code in their Care tab, then enter it here.
            </ThemedText>
            <TextInput
              value={codeInput}
              onChangeText={(t) => setCodeInput(t.toUpperCase())}
              placeholder="e.g. ABC12345"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
            />
            <View style={[styles.btnRow, { marginTop: Spacing.lg }]}>
              <Pressable onPress={() => { setModal(null); setCodeInput(""); }} style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
                <ThemedText style={{ fontWeight: "600" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={handleAddPatient} disabled={busy || !codeInput.trim()} style={[styles.actionBtn, { backgroundColor: theme.primary, flex: 1, opacity: codeInput.trim() ? 1 : 0.5 }]}>
                {busy ? <ActivityIndicator color="#fff" size="small" /> : <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Add Patient</ThemedText>}
              </Pressable>
            </View>
          </ElevatedCard>
        </View>
      </Modal>

      {/* ── ASSIGN STAFF MODAL ── */}
      <Modal visible={modal === "assign"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ElevatedCard padding={Spacing.lg} style={styles.modalCard}>
            <ThemedText style={{ fontWeight: "800", fontSize: 16, marginBottom: Spacing.md }}>Assign Staff to Patient</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.55, marginBottom: Spacing.sm }}>Staff member:</ThemedText>
            {org.members.map((m) => (
              <Pressable key={m.id} onPress={() => setAssignStaffId(m.userId)}
                style={[styles.pickRow, { borderColor: assignStaffId === m.userId ? theme.primary : theme.border, backgroundColor: assignStaffId === m.userId ? theme.primary + "14" : "transparent" }]}>
                <ThemedText type="small" style={{ fontWeight: assignStaffId === m.userId ? "700" : "400" }}>{m.name}</ThemedText>
              </Pressable>
            ))}
            <ThemedText type="caption" style={{ opacity: 0.55, marginTop: Spacing.md, marginBottom: Spacing.sm }}>Patient:</ThemedText>
            {org.patients.map((p) => (
              <Pressable key={p.id} onPress={() => setAssignPatientId(p.patientId)}
                style={[styles.pickRow, { borderColor: assignPatientId === p.patientId ? "#5B8DEF" : theme.border, backgroundColor: assignPatientId === p.patientId ? "#5B8DEF14" : "transparent" }]}>
                <ThemedText type="small" style={{ fontWeight: assignPatientId === p.patientId ? "700" : "400" }}>{p.name}</ThemedText>
              </Pressable>
            ))}
            <View style={[styles.btnRow, { marginTop: Spacing.lg }]}>
              <Pressable onPress={() => { setModal(null); setAssignStaffId(""); setAssignPatientId(""); }} style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
                <ThemedText style={{ fontWeight: "600" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={handleAssign} disabled={busy || !assignStaffId || !assignPatientId}
                style={[styles.actionBtn, { backgroundColor: theme.primary, flex: 1, opacity: assignStaffId && assignPatientId ? 1 : 0.5 }]}>
                {busy ? <ActivityIndicator color="#fff" size="small" /> : <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Assign</ThemedText>}
              </Pressable>
            </View>
          </ElevatedCard>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.sm },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  orgAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: StyleSheet.hairlineWidth },
  listRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalCard: { margin: Spacing.lg, borderRadius: BorderRadius.large },
  codeBox: {
    alignItems: "center", justifyContent: "center", padding: Spacing.lg,
    borderRadius: BorderRadius.medium, borderWidth: 1, marginVertical: Spacing.sm,
  },
  roleRow: { flexDirection: "row", gap: Spacing.sm },
  roleChip: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  textInput: {
    borderWidth: 1, borderRadius: BorderRadius.medium,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, letterSpacing: 2,
  },
  btnRow: { flexDirection: "row", gap: Spacing.sm },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.md, borderRadius: BorderRadius.medium },
  pickRow: { padding: Spacing.sm, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
});
