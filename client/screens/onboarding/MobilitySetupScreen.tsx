import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { OnboardingInput } from "@/components/onboarding/OnboardingInput";
import { ChipSelector } from "@/components/onboarding/ChipSelector";
import { DropdownPicker } from "@/components/profile/DropdownPicker";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingStack";
import { StepHeader, FooterButtons } from "./InjuryDetailsScreen";

const WHEELCHAIR_TYPES = [
  "Manual Chair",
  "Power Chair",
  "Power Assist",
  "Sport / Racing Chair",
  "Tilt-in-Space Chair",
  "Mobility Scooter",
  "Other",
];

const ASSISTIVE_TECH_OPTIONS = [
  "Voice Control",
  "Switch Control",
  "Eye Gaze",
  "Head Mouse",
  "Sip and Puff",
  "Power Assist Wheels",
  "Environmental Control",
  "Other",
];

export default function MobilitySetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<RouteProp<OnboardingStackParamList, "MobilitySetup">>();
  const { theme } = useTheme();
  const draft = route.params.draft;

  const [wheelchairType, setWheelchairType] = useState(draft.wheelchairType ?? "");
  const [wheelchairModel, setWheelchairModel] = useState(draft.wheelchairModel ?? "");
  const [assistiveTechList, setAssistiveTechList] = useState<string[]>(
    draft.assistiveTechList ?? []
  );

  const next = () => {
    navigation.navigate("CareSupport", {
      draft: {
        ...draft,
        wheelchairType,
        wheelchairModel,
        assistiveTechList,
        assistiveTech: assistiveTechList.join(", "),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <StepHeader step={2} total={5} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Feather name="disc" size={32} color={theme.primary} style={styles.icon} />
        <ThemedText type="h2" style={styles.title}>Mobility Setup</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tell us about your equipment so we can show the most relevant products.
        </ThemedText>

        <DropdownPicker
          label="Wheelchair Type"
          value={wheelchairType}
          options={WHEELCHAIR_TYPES}
          onChange={setWheelchairType}
        />
        <OnboardingInput
          label="Wheelchair Model"
          value={wheelchairModel}
          onChange={setWheelchairModel}
          placeholder="e.g. Quickie Nitrum, Permobil M3"
        />
        <ChipSelector
          label="Assistive Technology"
          options={ASSISTIVE_TECH_OPTIONS}
          selected={assistiveTechList}
          onChange={setAssistiveTechList}
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
