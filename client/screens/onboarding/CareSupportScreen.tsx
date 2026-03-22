import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { OnboardingInput } from "@/components/onboarding/OnboardingInput";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingStack";
import { StepHeader, FooterButtons } from "./InjuryDetailsScreen";

export default function CareSupportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<RouteProp<OnboardingStackParamList, "CareSupport">>();
  const { theme } = useTheme();
  const draft = route.params.draft;

  const [emergencyContactName, setEmergencyContactName] = useState(
    draft.emergencyContactName ?? ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    draft.emergencyContactPhone ?? ""
  );
  const [careCompanies, setCareCompanies] = useState(draft.careCompanies ?? "");
  const [careNotes, setCareNotes] = useState(draft.careNotes ?? "");

  const next = () => {
    const combined =
      emergencyContactName && emergencyContactPhone
        ? `${emergencyContactName} — ${emergencyContactPhone}`
        : emergencyContactName || emergencyContactPhone;

    navigation.navigate("MedicalCardSetup", {
      draft: {
        ...draft,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContact: combined,
        careCompanies,
        careNotes,
        caregiverNotes: careNotes,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <StepHeader step={3} total={5} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Feather name="users" size={32} color={theme.primary} style={styles.icon} />
        <ThemedText type="h2" style={styles.title}>Care & Support</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Helps caregivers and support workers understand your setup at a glance.
        </ThemedText>

        <OnboardingInput
          label="Emergency Contact Name"
          value={emergencyContactName}
          onChange={setEmergencyContactName}
          placeholder="e.g. Sarah Whalen"
        />
        <OnboardingInput
          label="Emergency Contact Phone"
          value={emergencyContactPhone}
          onChange={setEmergencyContactPhone}
          placeholder="e.g. +64 21 987 6543"
          keyboardType="phone-pad"
        />
        <OnboardingInput
          label="Care Companies"
          value={careCompanies}
          onChange={setCareCompanies}
          placeholder="e.g. Explore Support, Allied Health NZ"
        />
        <OnboardingInput
          label="Care Notes"
          value={careNotes}
          onChange={setCareNotes}
          placeholder="e.g. Morning routine 7am–9am. Bowel care Tue & Fri."
          multiline
        />
      </ScrollView>

      <FooterButtons onSkip={next} onNext={next} theme={theme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  icon: { marginBottom: Spacing.sm },
  title: { marginBottom: Spacing.sm },
  subtitle: { marginBottom: Spacing.xl, fontSize: 16 },
});
