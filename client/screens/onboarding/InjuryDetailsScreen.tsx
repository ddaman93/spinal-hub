import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { OnboardingInput } from "@/components/onboarding/OnboardingInput";
import { DropdownPicker } from "@/components/profile/DropdownPicker";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingStack";

const INJURY_TYPES = ["Complete", "Incomplete"];

const INJURY_LEVELS = [
  "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
  "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12",
  "L1", "L2", "L3", "L4", "L5",
  "S1", "S2", "S3", "S4", "S5",
  "Cauda Equina",
  "Other / Unsure",
];

const REHAB_CENTRES = [
  "Burwood Spinal Unit (Christchurch)",
  "Auckland Spinal Rehabilitation Unit (Otara)",
  "Wellington Spinal Unit (Hutt Hospital)",
  "Middlemore Hospital Spinal Unit",
  "Dunedin Hospital Rehab Unit",
  "Other",
  "None / Community",
];

const TOTAL_STEPS = 5;
const STEP = 1;

export default function InjuryDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<RouteProp<OnboardingStackParamList, "InjuryDetails">>();
  const { theme } = useTheme();
  const draft = route.params.draft;

  const [injuryLevel, setInjuryLevel] = useState(draft.injuryLevel ?? "");
  const [injuryType, setInjuryType] = useState(draft.injuryType ?? "");
  const [injuryDate, setInjuryDate] = useState(draft.injuryDate ?? "");
  const [rehabCentre, setRehabCentre] = useState(draft.rehabCentre ?? "");

  const next = () => {
    navigation.navigate("MobilitySetup", {
      draft: { ...draft, injuryLevel, injuryType, injuryDate, rehabCentre },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      {/* Step indicator */}
      <StepHeader step={STEP} total={TOTAL_STEPS} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Feather name="activity" size={32} color={theme.primary} style={styles.icon} />
        <ThemedText type="h2" style={styles.title}>Injury Details</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          This helps personalise your equipment and care recommendations.
        </ThemedText>

        <DropdownPicker
          label="Injury Level"
          value={injuryLevel}
          options={INJURY_LEVELS}
          onChange={setInjuryLevel}
        />
        <DropdownPicker
          label="Injury Type"
          value={injuryType}
          options={INJURY_TYPES}
          onChange={setInjuryType}
        />
        <OnboardingInput
          label="Injury Date"
          value={injuryDate}
          onChange={setInjuryDate}
          placeholder="e.g. March 2019"
        />
        <DropdownPicker
          label="Rehab Centre"
          value={rehabCentre}
          options={REHAB_CENTRES}
          onChange={setRehabCentre}
        />
      </ScrollView>

      <FooterButtons onSkip={next} onNext={next} theme={theme} />
    </SafeAreaView>
  );
}

/* ─── shared sub-components ─── */

export function StepHeader({
  step,
  total,
  theme,
}: {
  step: number;
  total: number;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={[stepStyles.wrapper, { borderBottomColor: theme.border }]}>
      <ThemedText type="small" style={[stepStyles.label, { color: theme.textSecondary }]}>
        Step {step} of {total}
      </ThemedText>
      <View style={[stepStyles.track, { backgroundColor: theme.backgroundSecondary }]}>
        <View
          style={[
            stepStyles.fill,
            { backgroundColor: theme.primary, width: `${(step / total) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

export function FooterButtons({
  onNext,
  onSkip,
  nextLabel = "Continue",
  theme,
}: {
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={[footerStyles.wrapper, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.border }]}>
      {onSkip && (
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [footerStyles.skip, pressed && { opacity: 0.5 }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <ThemedText type="body" style={[footerStyles.skipText, { color: theme.textSecondary }]}>
            Skip
          </ThemedText>
        </Pressable>
      )}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          footerStyles.next,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1, flex: onSkip ? 1 : undefined, width: onSkip ? undefined : "100%" },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={nextLabel}
      >
        <ThemedText type="body" style={footerStyles.nextText}>
          {nextLabel}
        </ThemedText>
        <Feather name="arrow-right" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  icon: { marginBottom: Spacing.sm },
  title: { marginBottom: Spacing.sm },
  subtitle: { marginBottom: Spacing.xl, fontSize: 16 },
});

const stepStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  label: { fontWeight: "500" },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});

const footerStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  skip: {
    height: 56,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.medium,
  },
  skipText: { fontWeight: "600" },
  next: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.medium,
  },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 17 },
});
