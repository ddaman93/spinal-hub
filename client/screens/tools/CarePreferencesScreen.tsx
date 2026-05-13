import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { MainStackParamList } from "@/types/navigation";

type Route = RouteProp<MainStackParamList, "CarePreferences">;

type Prefs = {
  name: string;
  injuryLevel: string;
  injuryType: string;
  equipment: string;
  allergies: string;
  medicationsSummary: string;
  morningCareNotes: string;
  eveningCareNotes: string;
  otherNotes: string;
  updatedAt?: string | null;
};

const EMPTY: Prefs = {
  name: "", injuryLevel: "", injuryType: "", equipment: "",
  allergies: "", medicationsSummary: "", morningCareNotes: "",
  eveningCareNotes: "", otherNotes: "",
};

export default function CarePreferencesScreen() {
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [data, setData] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Prefs>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${getApiUrl()}/api/health/care-preferences?patientId=${encodeURIComponent(params.patientId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const row: Prefs | null = await res.json();
        if (row) {
          setData(row);
          setForm(row);
          setEditMode(false);
        } else {
          setEditMode(true);
        }
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [params.patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/health/care-preferences`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: params.patientId, ...form }),
      });
      if (res.ok) {
        const saved: Prefs = await res.json();
        setData(saved);
        setForm(saved);
        setEditMode(false);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const set = (field: keyof Prefs) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      </ThemedView>
    );
  }

  if (editMode) {
    return (
      <ThemedView style={styles.container}>
        <KeyboardAwareScrollViewCompat
          contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }]}
        >
          <ThemedText type="h3" style={styles.sectionTitle}>Personal</ThemedText>

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>Name</ThemedText>
          <TextInput value={form.name} onChangeText={set("name")} placeholder="Your full name" placeholderTextColor={theme.textSecondary} style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>Injury Level</ThemedText>
          <TextInput value={form.injuryLevel} onChangeText={set("injuryLevel")} placeholder="e.g. C5, T6" placeholderTextColor={theme.textSecondary} style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>Injury Type</ThemedText>
          <TextInput value={form.injuryType} onChangeText={set("injuryType")} placeholder="Complete or Incomplete" placeholderTextColor={theme.textSecondary} style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="h3" style={styles.sectionTitle}>Equipment</ThemedText>
          <TextInput value={form.equipment} onChangeText={set("equipment")} placeholder="e.g. Power wheelchair, ventilator" placeholderTextColor={theme.textSecondary} multiline style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="h3" style={styles.sectionTitle}>Allergies</ThemedText>
          <TextInput value={form.allergies} onChangeText={set("allergies")} placeholder="List any known allergies" placeholderTextColor={theme.textSecondary} multiline style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="h3" style={styles.sectionTitle}>Medications Summary</ThemedText>
          <TextInput value={form.medicationsSummary} onChangeText={set("medicationsSummary")} placeholder="Brief summary of current medications" placeholderTextColor={theme.textSecondary} multiline style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="h3" style={styles.sectionTitle}>Morning Care</ThemedText>
          <TextInput value={form.morningCareNotes} onChangeText={set("morningCareNotes")} placeholder="Morning care routine notes" placeholderTextColor={theme.textSecondary} multiline style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="h3" style={styles.sectionTitle}>Evening Care</ThemedText>
          <TextInput value={form.eveningCareNotes} onChangeText={set("eveningCareNotes")} placeholder="Evening care routine notes" placeholderTextColor={theme.textSecondary} multiline style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <ThemedText type="h3" style={styles.sectionTitle}>Other Notes</ThemedText>
          <TextInput value={form.otherNotes} onChangeText={set("otherNotes")} placeholder="Any other important information" placeholderTextColor={theme.textSecondary} multiline style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]} />

          <Button onPress={handleSave} style={styles.saveButton} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>

          {data && (
            <Pressable onPress={() => { setForm(data); setEditMode(false); }} style={styles.cancelLink}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          )}
        </KeyboardAwareScrollViewCompat>
      </ThemedView>
    );
  }

  if (!data) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }]}>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={styles.cardName}>{data.name || "—"}</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {[data.injuryLevel, data.injuryType].filter(Boolean).join(" · ") || "—"}
          </ThemedText>
        </View>

        <InfoSection title="Equipment" value={data.equipment} theme={theme} />

        {data.allergies ? (
          <View style={[styles.infoSection, { backgroundColor: "#ef444422" }]}>
            <ThemedText type="small" style={[styles.infoLabel, { color: "#ef4444" }]}>ALLERGIES</ThemedText>
            <ThemedText type="body" style={{ color: "#ef4444" }}>{data.allergies}</ThemedText>
          </View>
        ) : (
          <InfoSection title="Allergies" value="None known" theme={theme} />
        )}

        <InfoSection title="Medications" value={data.medicationsSummary} theme={theme} />
        <InfoSection title="Morning Care" value={data.morningCareNotes} theme={theme} />
        <InfoSection title="Evening Care" value={data.eveningCareNotes} theme={theme} />
        <InfoSection title="Other Notes" value={data.otherNotes} theme={theme} />

        <View style={styles.footer}>
          {data.updatedAt ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Last updated {new Date(data.updatedAt).toLocaleDateString("en-NZ")}
            </ThemedText>
          ) : null}
          <Button onPress={() => setEditMode(true)} style={styles.editButton}>Edit</Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoSection({ title, value, theme }: { title: string; value: string; theme: any }) {
  return (
    <View style={[styles.infoSection, { backgroundColor: theme.backgroundDefault }]}>
      <ThemedText type="small" style={[styles.infoLabel, { color: theme.textSecondary }]}>{title.toUpperCase()}</ThemedText>
      <ThemedText type="body">{value || "—"}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  card: { padding: Spacing.xl, borderRadius: BorderRadius.medium, gap: Spacing.xs, marginBottom: Spacing.sm },
  cardName: { marginBottom: Spacing.xs },
  infoSection: { padding: Spacing.lg, borderRadius: BorderRadius.medium, gap: Spacing.xs },
  infoLabel: { fontWeight: "600", letterSpacing: 0.5, marginBottom: 2 },
  footer: { gap: Spacing.md, alignItems: "center", paddingTop: Spacing.md },
  editButton: { alignSelf: "stretch" },
  sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.xs },
  label: { marginBottom: Spacing.xs, fontWeight: "500" },
  input: { height: 48, borderRadius: BorderRadius.medium, paddingHorizontal: Spacing.md, fontSize: 16, marginBottom: Spacing.md },
  multilineInput: { height: 96, paddingTop: Spacing.sm, textAlignVertical: "top" },
  saveButton: { marginTop: Spacing.lg },
  cancelLink: { alignItems: "center", paddingVertical: Spacing.md },
});
