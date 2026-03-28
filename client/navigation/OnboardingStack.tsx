import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserProfile } from "@/types/user";

import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";
import RoleSelectScreen from "@/screens/onboarding/RoleSelectScreen";
import PersonalSetupScreen from "@/screens/onboarding/PersonalSetupScreen";
import InjuryDetailsScreen from "@/screens/onboarding/InjuryDetailsScreen";
import MobilitySetupScreen from "@/screens/onboarding/MobilitySetupScreen";
import CareSupportScreen from "@/screens/onboarding/CareSupportScreen";
import MedicalCardSetupScreen from "@/screens/onboarding/MedicalCardSetupScreen";
import OnboardingCompleteScreen from "@/screens/onboarding/OnboardingCompleteScreen";
import FeatureTourScreen from "@/screens/onboarding/FeatureTourScreen";

export type OnboardingDraft = Partial<UserProfile>;

export type OnboardingStackParamList = {
  Welcome: undefined;
  RoleSelect: { draft: OnboardingDraft };
  PersonalSetup: { draft: OnboardingDraft };
  InjuryDetails: { draft: OnboardingDraft };
  MobilitySetup: { draft: OnboardingDraft };
  CareSupport: { draft: OnboardingDraft };
  MedicalCardSetup: { draft: OnboardingDraft };
  OnboardingComplete: { draft: OnboardingDraft };
  FeatureTour: undefined;
};

// Module-level callback so OnboardingCompleteScreen can trigger app transition
// without needing context or threaded props.
let _onComplete: () => void = () => {};
export function triggerOnboardingComplete() {
  _onComplete();
}

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack({ onComplete }: { onComplete: () => void }) {
  _onComplete = onComplete;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="PersonalSetup" component={PersonalSetupScreen} />
      <Stack.Screen name="InjuryDetails" component={InjuryDetailsScreen} />
      <Stack.Screen name="MobilitySetup" component={MobilitySetupScreen} />
      <Stack.Screen name="CareSupport" component={CareSupportScreen} />
      <Stack.Screen name="MedicalCardSetup" component={MedicalCardSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
      <Stack.Screen name="FeatureTour" component={FeatureTourScreen} />
    </Stack.Navigator>
  );
}
