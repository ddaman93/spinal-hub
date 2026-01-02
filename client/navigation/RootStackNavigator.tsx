import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useScreenOptions } from "@/constants/hooks/useScreenOptions";
import { useTheme } from "@/constants/hooks/useTheme";
import { MainStackParamList } from "@/types/navigation";
import PressureReliefTimerScreen from "@/screens/tools/PressureReliefTimerScreen";


import DashboardScreen from "@/screens/DashboardScreen";
import CategoryDetailScreen from "@/screens/CategoryDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import VitalsLogScreen from "@/screens/tools/VitalsLogScreen";
import PainJournalScreen from "@/screens/tools/PainJournalScreen";
import MedicationTrackerScreen from "@/screens/tools/MedicationTrackerScreen";
import HydrationTrackerScreen from "@/screens/tools/HydrationTrackerScreen";
import { MorningRoutineScreen, EveningRoutineScreen } from "@/screens/tools/RoutineScreen";
import AppointmentSchedulerScreen from "@/screens/tools/AppointmentSchedulerScreen";
import EmergencyContactsScreen from "@/screens/tools/EmergencyContactsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import AssistiveTechDetailScreen from "@/screens/AssistiveTechDetailScreen";
import AssistiveTechListScreen from "@/screens/AssistiveTechListScreen";
import ClinicalTrialsListScreen from "@/screens/ClinicalTrialsListScreen";
import ClinicalTrialDetailScreen from "@/screens/ClinicalTrialDetailScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

function SettingsHeaderButton() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useTheme();

  return (
    <HeaderButton
      onPress={() => navigation.navigate("Settings")}
      accessibilityLabel="Settings"
    >
      <Feather name="settings" size={22} color={theme.text} />
    </HeaderButton>
  );
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Spinal Hub" />,
          headerRight: () => <SettingsHeaderButton />,
        }}
      />
      <Stack.Screen
        name="ClinicalTrialsList"
        component={ClinicalTrialsListScreen}
        options={{ title: "Clinical Trials" }}
      />

      <Stack.Screen
        name="ClinicalTrialDetail"
        component={ClinicalTrialDetailScreen}
        options={{ title: "Clinical Trial" }}
      />
      <Stack.Screen
        name="AssistiveTechList"
        component={AssistiveTechListScreen}
        options={{ title: "Assistive Technology" }}
      />
      <Stack.Screen
        name="AssistiveTechDetail"
        component={AssistiveTechDetailScreen}
        options={{ title: "Assistive Technology" }}
      />
      <Stack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={({ route }) => ({
          ...opaqueScreenOptions,
          headerTitle: route.params.title,
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="VitalsLog"
        component={VitalsLogScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Vital Signs Log",
        }}
      />
      <Stack.Screen
        name="PainJournal"
        component={PainJournalScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Pain Journal",
        }}
      />
      <Stack.Screen
        name="MedicationTracker"
        component={MedicationTrackerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Medications",
        }}
      />
      <Stack.Screen
        name="HydrationTracker"
        component={HydrationTrackerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Hydration Tracker",
        }}
      />
      <Stack.Screen
        name="MorningRoutine"
        component={MorningRoutineScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Morning Routine",
        }}
      />
      <Stack.Screen
        name="EveningRoutine"
        component={EveningRoutineScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Evening Routine",
        }}
      />
      <Stack.Screen
        name="AppointmentScheduler"
        component={AppointmentSchedulerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Appointments",
        }}
      />
      <Stack.Screen
        name="PressureReliefTimer"
        component={PressureReliefTimerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Pressure Relief",
        }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Emergency Contacts",
        }}
      />
    </Stack.Navigator>
  );
}
