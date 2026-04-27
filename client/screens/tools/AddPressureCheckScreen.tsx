import React, { useState } from "react";
import {
  View, ScrollView, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { SITES, STAGE_LABELS, stageColor } from "./PressureInjuryTrackerScreen";

type Route = RouteProp<MainStackParamList, "AddPressureCheck">;

const STAGES = ["clear", "stage1", "stage2", "stage3", "stage4", "unstageable", "dti"] as const;

const WOUND_BED_OPTIONS = [
  { id: "none", label: "None / Intact" },
  { id: "granulation", label: "Granulation" },
  { id: "slough", label: "Slough (yellow)" },
  { id: "eschar", label: "Eschar (black/brown)" },
  { id: "epithelializing", label: "Epithelializing" },
];

const EXUDATE_OPTIONS = [
  { id: "none", label: "None" },
  { id: "scant", label: "Scant" },
  { id: "moderate", label: "Moderate" },
  { id: "heavy", label: "Heavy" },
];

const SKIN_OPTIONS = [
  { id: "intact", label: "Intact" },
  { id: "erythema", label: "Erythema" },
  { id: "macerated", label: "Macerated" },
  { id: "induration", label: "Induration" },
];

function OptionPill<T extends string>({
  options, value, onChange,
}: { options: { id: T; label: string }[]; value: T | null; onChange: (v: T) => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.pillRow}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.pill, {
              backgroundColor: active ? theme.primary : theme.backgroundSecondary,
              borderColor: active ? theme.primary : theme.backgroundTertiary,
            }]}
          >
            <ThemedText type="caption" style={{ color: active ? "#fff" : theme.text, fontWeight: active ? "700" : "400" }}>
              {o.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AddPressureCheckScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const site = SITES.find((s) => s.id === params.site);

  const [stage, setStage] = useState<string | null>(null);
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [depthCm, setDepthCm] = useState("");
  const [woundBed, setWoundBed] = useState<string | null>(null);
  const [exudate, setExudate] = useState<string | null>(null);
  const [surroundingSkin, setSurroundingSkin] = useState<string | null>(null);
  const [odor, setOdor] = useState(false);
  const [painScore, setPainScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!stage) { Alert.alert("Required", "Please select a stage."); return; }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/pressure-injuries/${params.injuryId}/checks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          stage,
          lengthCm: lengthCm ? parseFloat(lengthCm) : null,
          widthCm: widthCm ? parseFloat(widthCm) : null,
          depthCm: depthCm ? parseFloat(depthCm) : null,
          woundBed,
          exudate,
          surroundingSkin,
          odor,
          painScore,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save assessment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl + 80 }}
        >
          <View style={styles.form}>
            {/* Site label */}
            <ThemedText type="h4" style={{ marginBottom: Spacing.xs }}>
              {site?.label ?? params.site}
            </ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.5, marginBottom: Spacing.lg }}>
              {new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </ThemedText>

            {/* Stage */}
            <ThemedText type="small" style={styles.fieldLabel}>Pressure Injury Stage *</ThemedText>
            <View style={styles.stageGrid}>
              {STAGES.map((s) => {
                const active = stage === s;
                const color = stageColor(s);
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStage(s)}
                    style={[styles.stageCard, {
                      backgroundColor: active ? color + "22" : theme.backgroundSecondary,
                      borderColor: active ? color : theme.backgroundTertiary,
                      borderWidth: active ? 2 : 1,
                    }]}
                  >
                    <View style={[styles.stageDot, { backgroundColor: color }]} />
                    <ThemedText type="caption" style={{ fontWeight: active ? "700" : "400", textAlign: "center", fontSize: 11 }}>
                      {STAGE_LABELS[s]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* Size */}
            {stage && stage !== "clear" && (
              <>
                <ThemedText type="small" style={styles.fieldLabel}>Wound Size (cm)</ThemedText>
                <View style={styles.measureRow}>
                  {[
                    { label: "Length", value: lengthCm, set: setLengthCm },
                    { label: "Width", value: widthCm, set: setWidthCm },
                    { label: "Depth", value: depthCm, set: setDepthCm },
                  ].map(({ label, value, set }) => (
                    <View key={label} style={[styles.measureField, { backgroundColor: theme.backgroundSecondary }]}>
                      <ThemedText type="caption" style={{ opacity: 0.5, fontSize: 10 }}>{label}</ThemedText>
                      <TextInput
                        value={value}
                        onChangeText={set}
                        keyboardType="decimal-pad"
                        placeholder="0.0"
                        placeholderTextColor={theme.textSecondary}
                        style={{ color: theme.text, fontSize: 18, fontWeight: "600", textAlign: "center" }}
                      />
                    </View>
                  ))}
                </View>

                {/* Wound bed */}
                <ThemedText type="small" style={styles.fieldLabel}>Wound Bed</ThemedText>
                <OptionPill options={WOUND_BED_OPTIONS} value={woundBed} onChange={setWoundBed} />

                {/* Exudate */}
                <ThemedText type="small" style={styles.fieldLabel}>Exudate Amount</ThemedText>
                <OptionPill options={EXUDATE_OPTIONS} value={exudate} onChange={setExudate} />
              </>
            )}

            {/* Surrounding skin */}
            <ThemedText type="small" style={styles.fieldLabel}>Surrounding Skin</ThemedText>
            <OptionPill options={SKIN_OPTIONS} value={surroundingSkin} onChange={setSurroundingSkin} />

            {/* Odour */}
            <Pressable
              onPress={() => setOdor((v) => !v)}
              style={[styles.toggleRow, { backgroundColor: theme.backgroundSecondary }]}
            >
              <View>
                <ThemedText type="small" style={{ fontWeight: "600" }}>Odour Present</ThemedText>
                <ThemedText type="caption" style={{ opacity: 0.5 }}>Indicates possible infection</ThemedText>
              </View>
              <View style={[styles.toggle, { backgroundColor: odor ? "#FF6B6B" : theme.backgroundTertiary }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: odor ? 20 : 0 }] }]} />
              </View>
            </Pressable>

            {/* Pain score */}
            <ThemedText type="small" style={styles.fieldLabel}>Pain at Site (0–10)</ThemedText>
            <View style={styles.painRow}>
              {Array.from({ length: 11 }, (_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setPainScore(painScore === i ? null : i)}
                  style={[styles.painBtn, {
                    backgroundColor: painScore === i ? theme.primary : theme.backgroundSecondary,
                  }]}
                >
                  <ThemedText type="caption" style={{ color: painScore === i ? "#fff" : theme.text, fontWeight: "600", fontSize: 11 }}>
                    {i}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Notes */}
            <ThemedText type="small" style={styles.fieldLabel}>Clinical Notes</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional observations..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              style={[styles.notesInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            />
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => ({ opacity: pressed || saving ? 0.8 : 1, flex: 1 })}>
            <LinearGradient
              colors={["#00E676", "#00C853"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Feather name="check" size={18} color="#fff" />
                    <ThemedText type="small" style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>
                      Save Assessment
                    </ThemedText>
                  </>
                )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: { padding: Spacing.lg, gap: Spacing.md },
  fieldLabel: { fontWeight: "600", marginBottom: 4, marginTop: Spacing.xs },
  stageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stageCard: {
    width: "30%", padding: Spacing.sm, borderRadius: BorderRadius.small,
    alignItems: "center", gap: 4,
  },
  stageDot: { width: 12, height: 12, borderRadius: 6 },
  measureRow: { flexDirection: "row", gap: Spacing.sm },
  measureField: {
    flex: 1, borderRadius: BorderRadius.small, padding: Spacing.sm,
    alignItems: "center", gap: 2,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: Spacing.md, borderRadius: BorderRadius.medium,
  },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: "center" },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  painRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  painBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  notesInput: {
    borderRadius: BorderRadius.medium, padding: Spacing.md,
    fontSize: 14, textAlignVertical: "top", minHeight: 100,
  },
  footer: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.1)",
  },
  saveBtn: {
    height: 54, borderRadius: BorderRadius.medium,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
});
