import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, CarePreferences } from "@/lib/storage";

const EMPTY_PREFS: CarePreferences = {
  name: "",
  injuryLevel: "",
  injuryType: "",
  equipment: "",
  allergies: "",
  medicationsSummary: "",
  morningCareNotes: "",
  eveningCareNotes: "",
  otherNotes: "",
  lastUpdated: "",
};

export default function CarePreferencesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [data, setData] = useState<CarePreferences | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<CarePreferences>(EMPTY_PREFS);

  const loadData = useCallback(async () => {
    const saved = await storage.carePreferences.get();
    if (saved) {
      setData(saved);
      setForm(saved);
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    const toSave: CarePreferences = {
      ...form,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    await storage.carePreferences.save(toSave);
    setData(toSave);
    setForm(toSave);
    setEditMode(false);
  };

  const set = (field: keyof CarePreferences) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (editMode) {
    return (
      <ThemedView style={styles.container}>
        <KeyboardAwareScrollViewCompat
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xxl },
          ]}
        >
          <ThemedText type="h3" style={styles.sectionTitle}>Personal</ThemedText>

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>Name</ThemedText>
          <TextInput
            value={form.name}
            onChangeText={set("name")}
            placeholder="Your full name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>Injury Level</ThemedText>
          <TextInput
            value={form.injuryLevel}
            onChangeText={set("injuryLevel")}
            placeholder="e.g. C5, T6"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>Injury Type</ThemedText>
          <TextInput
            value={form.injuryType}
            onChangeText={set("injuryType")}
            placeholder="Complete or Incomplete"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="h3" style={styles.sectionTitle}>Equipment</ThemedText>
          <TextInput
            value={form.equipment}
            onChangeText={set("equipment")}
            placeholder="e.g. Power wheelchair, ventilator"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="h3" style={styles.sectionTitle}>Allergies</ThemedText>
          <TextInput
            value={form.allergies}
            onChangeText={set("allergies")}
            placeholder="List any known allergies"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="h3" style={styles.sectionTitle}>Medications Summary</ThemedText>
          <TextInput
            value={form.medicationsSummary}
            onChangeText={set("medicationsSummary")}
            placeholder="Brief summary of current medications"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="h3" style={styles.sectionTitle}>Morning Care</ThemedText>
          <TextInput
            value={form.morningCareNotes}
            onChangeText={set("morningCareNotes")}
            placeholder="Morning care routine notes"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="h3" style={styles.sectionTitle}>Evening Care</ThemedText>
          <TextInput
            value={form.eveningCareNotes}
            onChangeText={set("eveningCareNotes")}
            placeholder="Evening care routine notes"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <ThemedText type="h3" style={styles.sectionTitle}>Other Notes</ThemedText>
          <TextInput
            value={form.otherNotes}
            onChangeText={set("otherNotes")}
            placeholder="Any other important information"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, styles.multilineInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
          />

          <Button onPress={handleSave} style={styles.saveButton}>
            Save
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
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xxl }]}>
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
          {data.lastUpdated ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Last updated {data.lastUpdated}
            </ThemedText>
          ) : null}
          <Button onPress={() => setEditMode(true)} style={styles.editButton}>
            Edit
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoSection({
  title,
  value,
  theme,
}: {
  title: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={[styles.infoSection, { backgroundColor: theme.backgroundDefault }]}>
      <ThemedText type="small" style={[styles.infoLabel, { color: theme.textSecondary }]}>
        {title.toUpperCase()}
      </ThemedText>
      <ThemedText type="body">{value || "—"}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.medium,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardName: {
    marginBottom: Spacing.xs,
  },
  infoSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.xs,
  },
  infoLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footer: {
    gap: Spacing.md,
    alignItems: "center",
    paddingTop: Spacing.md,
  },
  editButton: {
    alignSelf: "stretch",
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  multilineInput: {
    height: 96,
    paddingTop: Spacing.sm,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
  cancelLink: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
