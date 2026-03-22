import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import { ThemedText } from "@/components/ThemedText";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { DropdownPicker } from "@/components/profile/DropdownPicker";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserProfile } from "@/types/user";
import { MainStackParamList } from "@/types/navigation";
import { PROFILE_STORAGE_KEY, DEFAULT_USER } from "@/screens/ProfileScreen";

/* ─── dropdown options ─── */

const WHEELCHAIR_TYPES = [
  "Manual Chair",
  "Power Chair",
  "Sport / Racing Chair",
  "Beach / All-Terrain Chair",
  "Standing Chair",
  "Tilt-in-Space Chair",
  "Reclining Chair",
  "Mobility Scooter",
  "Other",
];

const INJURY_LEVELS = [
  // Cervical
  "C1 — Complete", "C1 — Incomplete",
  "C2 — Complete", "C2 — Incomplete",
  "C3 — Complete", "C3 — Incomplete",
  "C4 — Complete", "C4 — Incomplete",
  "C5 — Complete", "C5 — Incomplete",
  "C6 — Complete", "C6 — Incomplete",
  "C7 — Complete", "C7 — Incomplete",
  "C8 — Complete", "C8 — Incomplete",
  // Thoracic
  "T1 — Complete", "T1 — Incomplete",
  "T2 — Complete", "T2 — Incomplete",
  "T3 — Complete", "T3 — Incomplete",
  "T4 — Complete", "T4 — Incomplete",
  "T5 — Complete", "T5 — Incomplete",
  "T6 — Complete", "T6 — Incomplete",
  "T7 — Complete", "T7 — Incomplete",
  "T8 — Complete", "T8 — Incomplete",
  "T9 — Complete", "T9 — Incomplete",
  "T10 — Complete", "T10 — Incomplete",
  "T11 — Complete", "T11 — Incomplete",
  "T12 — Complete", "T12 — Incomplete",
  // Lumbar
  "L1 — Complete", "L1 — Incomplete",
  "L2 — Complete", "L2 — Incomplete",
  "L3 — Complete", "L3 — Incomplete",
  "L4 — Complete", "L4 — Incomplete",
  "L5 — Complete", "L5 — Incomplete",
  // Sacral
  "S1 — Complete", "S1 — Incomplete",
  "S2 — Complete", "S2 — Incomplete",
  "S3 — Complete", "S3 — Incomplete",
  "S4 — Complete", "S4 — Incomplete",
  "S5 — Complete", "S5 — Incomplete",
  // Other
  "Cauda Equina Syndrome",
  "Conus Medullaris Syndrome",
  "Central Cord Syndrome",
  "Brown-Séquard Syndrome",
  "Anterior Cord Syndrome",
  "Other / Unknown",
];

/* ─── field types ─── */

type Field = {
  key: keyof UserProfile;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

const BASIC_INFO: Field[] = [
  { key: "name", label: "Name", placeholder: "Your full name" },
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "phone", label: "Phone", placeholder: "+64 21 000 0000" },
  { key: "location", label: "Location", placeholder: "City, Country" },
];


const CARE: Field[] = [
  { key: "emergencyContact", label: "Emergency Contact", placeholder: "Name — phone number" },
  { key: "careCompanies", label: "Care Companies", placeholder: "Company names" },
  { key: "caregiverNotes", label: "Caregiver Notes", placeholder: "Routine notes", multiline: true },
];

/* ─── reusable text field ─── */

function FieldInput({ field, value, onChange, isLast }: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  isLast?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.fieldRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        {field.label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline={field.multiline}
        style={[styles.input, { color: theme.text }, field.multiline && styles.inputMultiline]}
        accessible
        accessibilityLabel={field.label}
      />
    </View>
  );
}

/* ─── main screen ─── */

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [draft, setDraft] = useState<UserProfile>(DEFAULT_USER);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
      if (raw) setDraft(JSON.parse(raw));
    });
  }, []);

  const set = (key: keyof UserProfile) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draft));

    // Sync to server (best-effort)
    try {
      const token = await getToken();
      if (token) {
        await fetch(`${getApiUrl()}/api/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(draft),
        });
      }
    } catch {
      // Server sync failed — local save succeeded
    }

    setSaving(false);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            paddingHorizontal: Spacing.md,
          }}
        >
          <ProfileSection title="Basic Info">
            {BASIC_INFO.map((f, i) => (
              <FieldInput key={f.key} field={f} value={String(draft[f.key] ?? "")} onChange={set(f.key)} isLast={i === BASIC_INFO.length - 1} />
            ))}
          </ProfileSection>

          <ProfileSection title="Injury Details">
            <DropdownPicker
              label="Injury Level"
              value={draft.injuryLevel}
              options={INJURY_LEVELS}
              onChange={set("injuryLevel")}
            />
            <FieldInput
              field={{ key: "injuryDate", label: "Injury Date", placeholder: "e.g. March 2019" }}
              value={draft.injuryDate}
              onChange={set("injuryDate")}
            />
            <FieldInput
              field={{ key: "rehabCentre", label: "Rehab Centre", placeholder: "Centre name and city" }}
              value={draft.rehabCentre}
              onChange={set("rehabCentre")}
              isLast
            />
          </ProfileSection>

          <ProfileSection title="Mobility">
            <DropdownPicker
              label="Wheelchair Type"
              value={draft.wheelchairType}
              options={WHEELCHAIR_TYPES}
              onChange={set("wheelchairType")}
            />
            <FieldInput
              field={{ key: "wheelchairModel", label: "Wheelchair Model", placeholder: "e.g. Quickie Nitrum" }}
              value={draft.wheelchairModel}
              onChange={set("wheelchairModel")}
              isLast
            />
          </ProfileSection>

          <ProfileSection title="Care & Support">
            {CARE.map((f, i) => (
              <FieldInput key={f.key} field={f} value={String(draft[f.key] ?? "")} onChange={set(f.key)} isLast={i === CARE.length - 1} />
            ))}
          </ProfileSection>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: theme.primary, opacity: pressed || saving ? 0.7 : 1 },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Save changes"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="body" style={styles.saveLabel}>
                Save Changes
              </ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fieldRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: "top",
  },
  /* save */
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  saveLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
