import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { OnboardingInput } from "@/components/onboarding/OnboardingInput";
import { FooterButtons } from "@/screens/onboarding/InjuryDetailsScreen";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingStack";

const ROLE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  caregiver:           "heart",
  health_professional: "briefcase",
  family_member:       "users",
};

export default function PersonalSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<RouteProp<OnboardingStackParamList, "PersonalSetup">>();
  const { theme } = useTheme();
  const draft = route.params.draft;
  const role = draft.role ?? "caregiver";

  const [name, setName]         = useState(draft.name ?? "");
  const [email, setEmail]       = useState(draft.email ?? "");
  const [phone, setPhone]       = useState(draft.phone ?? "");
  const [extra, setExtra]       = useState("");

  const icon = ROLE_ICONS[role] ?? "user";

  const extraLabel =
    role === "caregiver"           ? "Patient's Name"            :
    role === "health_professional" ? "Specialty / Institution"   :
    role === "family_member"       ? "Relationship to Patient"   : null;

  function next() {
    const extraField =
      role === "caregiver"           ? { caregiverNotes: extra } :
      role === "health_professional" ? { rehabCentre: extra }    :
      role === "family_member"       ? { careNotes: extra }      : {};

    navigation.navigate("OnboardingComplete", {
      draft: { ...draft, name, email, phone, ...extraField },
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Feather name={icon} size={32} color={theme.primary} style={styles.icon} />
        <ThemedText type="h2" style={styles.title}>Personal Setup</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tell us a little about yourself.
        </ThemedText>

        <OnboardingInput label="Name"  value={name}  onChange={setName}  placeholder="Your name" />
        <OnboardingInput label="Email" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <OnboardingInput label="Phone" value={phone} onChange={setPhone} placeholder="+64 21 000 0000" keyboardType="phone-pad" />

        {extraLabel && (
          <OnboardingInput
            label={extraLabel}
            value={extra}
            onChange={setExtra}
            placeholder=""
          />
        )}
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
