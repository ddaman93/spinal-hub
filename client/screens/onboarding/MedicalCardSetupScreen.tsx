import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { OnboardingInput } from "@/components/onboarding/OnboardingInput";
import { ChipSelector } from "@/components/onboarding/ChipSelector";
import { EmergencyCard } from "@/components/EmergencyCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingStack";
import { StepHeader, FooterButtons } from "./InjuryDetailsScreen";

const COMMON_ALLERGIES = [
  "Penicillin", "Amoxicillin", "Sulfa drugs", "Aspirin", "Ibuprofen",
  "Codeine", "Morphine", "Latex", "Iodine", "Contrast dye", "None known",
];

export default function MedicalCardSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<RouteProp<OnboardingStackParamList, "MedicalCardSetup">>();
  const { theme } = useTheme();
  const draft = route.params.draft;

  const [name, setName] = useState(draft.name ?? "");
  const [medications, setMedications] = useState(draft.medications ?? "");
  const [allergyList, setAllergyList] = useState<string[]>(
    draft.allergies ? draft.allergies.split(", ").filter(Boolean) : []
  );
  const [medicalNotes, setMedicalNotes] = useState(draft.medicalNotes ?? "");

  const allergies = allergyList.join(", ");
  const updatedDraft = { ...draft, name, medications, allergies, medicalNotes };

  const next = () => {
    navigation.navigate("OnboardingComplete", { draft: updatedDraft });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <StepHeader step={4} total={5} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Feather name="alert-triangle" size={32} color="#D32F2F" style={styles.icon} />
        <ThemedText type="h2" style={styles.title}>Emergency Medical Card</ThemedText>

        {/* Explainer */}
        <View style={[styles.notice, { backgroundColor: "#FFF3F3", borderColor: "#FFCDD2" }]}>
          <ThemedText type="small" style={styles.noticeText}>
            This card can be shown to first responders or caregivers in an emergency. It will be
            accessible from your profile at any time.
          </ThemedText>
        </View>

        <OnboardingInput
          label="Full Name"
          value={name}
          onChange={setName}
          placeholder="Your full name"
        />
        <OnboardingInput
          label="Medications"
          value={medications}
          onChange={setMedications}
          placeholder="e.g. Baclofen 10mg, Oxybutynin 5mg"
          multiline
        />
        <ChipSelector
          label="Allergies"
          options={COMMON_ALLERGIES}
          selected={allergyList}
          onChange={setAllergyList}
        />
        <OnboardingInput
          label="Notes for Paramedics"
          value={medicalNotes}
          onChange={setMedicalNotes}
          placeholder="e.g. Autonomic dysreflexia risk. Do not use tight blood pressure cuff."
          multiline
        />

        {/* Preview */}
        {(name || draft.injuryLevel || medications || allergies) ? (
          <View style={styles.previewSection}>
            <ThemedText type="small" style={[styles.previewLabel, { color: theme.textSecondary }]}>
              CARD PREVIEW
            </ThemedText>
            <EmergencyCard profile={updatedDraft} compact />
          </View>
        ) : null}
      </ScrollView>

      <FooterButtons onNext={next} nextLabel="Continue" theme={theme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  icon: { marginBottom: Spacing.sm },
  title: { marginBottom: Spacing.md },
  notice: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noticeText: {
    color: "#B71C1C",
    lineHeight: 20,
  },
  previewSection: {
    marginTop: Spacing.sm,
  },
  previewLabel: {
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
});
