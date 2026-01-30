import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useScreenOptions } from "@/constants/hooks/useScreenOptions";
import { useTheme } from "@/constants/hooks/useTheme";
import { Colors } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

import DashboardScreen from "@/screens/DashboardScreen";
import ToolsScreen from "@/screens/ToolsScreen";
import CategoryDetailScreen from "@/screens/CategoryDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import DisplaySettingsScreen from "@/screens/DisplaySettingsScreen";
import SciNewsListScreen from "@/screens/SciNewsListScreen";

import PressureReliefTimerScreen from "@/screens/tools/PressureReliefTimerScreen";
import VitalsLogScreen from "@/screens/tools/VitalsLogScreen";
import PainJournalScreen from "@/screens/tools/PainJournalScreen";
import MedicationTrackerScreen from "@/screens/tools/MedicationTrackerScreen";
import HydrationTrackerScreen from "@/screens/tools/HydrationTrackerScreen";
import {
  MorningRoutineScreen,
  EveningRoutineScreen,
} from "@/screens/tools/RoutineScreen";
import AppointmentSchedulerScreen from "@/screens/tools/AppointmentSchedulerScreen";
import EmergencyContactsScreen from "@/screens/tools/EmergencyContactsScreen";
import NZSpinalTrustScreen from "@/screens/NZSpinalTrustScreen";

import AssistiveTechListScreen from "@/screens/AssistiveTechListScreen";
import AssistiveTechDetailScreen from "@/screens/AssistiveTechDetailScreen";
import AllAssistiveTechScreen from "@/screens/AllAssistiveTechScreen";

import ClinicalTrialsListScreen from "@/screens/ClinicalTrialsListScreen";
import ClinicalTrialDetailScreen from "@/screens/ClinicalTrialDetailScreen";

import MobilityAssistiveTechScreen from "@/screens/MobilityAssistiveTechScreen";
import ManualWheelchairTechScreen from "@/screens/ManualWheelchairTechScreen";
import PowerWheelchairTechScreen from "@/screens/PowerWheelchairTechScreen";
import ProductDetailScreen from "@/screens/ProductDetailScreen";

import { HeaderTitle } from "@/components/HeaderTitle";
import { ThemeSwitchButton } from "@/components/ThemeSwitchButton";

const HomeStack = createNativeStackNavigator<MainStackParamList>();
const ToolsStack = createNativeStackNavigator<MainStackParamList>();
const SettingsStack = createNativeStackNavigator<MainStackParamList>();
const ProfileStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

/* ───────────────── header button ───────────────── */

function SettingsHeaderButton() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MainStackParamList>
    >();
  const { theme } = useTheme();

  return (
    <HeaderButton
      onPress={() => navigation.navigate("Settings")}
      accessibilityLabel="Settings"
    >
      <Feather
        name="settings"
        size={22}
        color={theme.text}
      />
    </HeaderButton>
  );
}

/* ───────────────── home stack ───────────────── */

function HomeStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      {/* DASHBOARD */}
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => (
            <HeaderTitle title="Spinal Hub" />
          ),
        }}
      />

      {/* ASSISTIVE TECH */}
      <HomeStack.Screen
        name="AssistiveTechList"
        component={AssistiveTechListScreen}
        options={{ title: "Assistive Technology" }}
      />

      <HomeStack.Screen
        name="AssistiveTechDetail"
        component={AssistiveTechDetailScreen}
        options={{ title: "Assistive Technology" }}
      />

      <HomeStack.Screen
        name="AllAssistiveTech"
        component={AllAssistiveTechScreen}
        options={{ title: "Assistive Technology" }}
      />

      <HomeStack.Screen
        name="ManualWheelchairTech"
        component={ManualWheelchairTechScreen}
        options={{ title: "Manual Wheelchair Tech" }}
      />

      <HomeStack.Screen
        name="PowerWheelchairTech"
        component={PowerWheelchairTechScreen}
        options={{ title: "Power Wheelchair Tech" }}
      />

      {/* CLINICAL TRIALS */}
      <HomeStack.Screen
        name="ClinicalTrialsList"
        component={ClinicalTrialsListScreen}
        options={{ title: "Clinical Trials" }}
      />

      <HomeStack.Screen
        name="ClinicalTrialDetail"
        component={ClinicalTrialDetailScreen}
        options={{ title: "Clinical Trial" }}
      />

      {/* PRODUCT DETAIL */}
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({
          title: route.params.product.title,
        })}
      />

      {/* SCI NEWS */}
      <HomeStack.Screen
        name="SciNewsList"
        component={SciNewsListScreen}
        options={{ title: "SCI News" }}
      />
    </HomeStack.Navigator>
  );
}

/* ───────────────── tools stack ───────────────── */

function ToolsStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <ToolsStack.Navigator screenOptions={screenOptions}>
      {/* TOOLS HOME */}
      <ToolsStack.Screen
        name="Tools"
        component={ToolsScreen}
        options={{
          headerTitle: () => (
            <HeaderTitle title="Tools" />
          ),
        }}
      />

      {/* CATEGORY */}
      <ToolsStack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={({ route }) => ({
          ...opaqueScreenOptions,
          headerTitle: route.params.title,
        })}
      />

      {/* TOOL SCREENS */}
      <ToolsStack.Screen
        name="VitalsLog"
        component={VitalsLogScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Vital Signs Log",
        }}
      />

      <ToolsStack.Screen
        name="PainJournal"
        component={PainJournalScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Pain Journal",
        }}
      />

      <ToolsStack.Screen
        name="MedicationTracker"
        component={MedicationTrackerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Medications",
        }}
      />

      <ToolsStack.Screen
        name="HydrationTracker"
        component={HydrationTrackerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Hydration Tracker",
        }}
      />

      <ToolsStack.Screen
        name="MorningRoutine"
        component={MorningRoutineScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Morning Routine",
        }}
      />

      <ToolsStack.Screen
        name="EveningRoutine"
        component={EveningRoutineScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Evening Routine",
        }}
      />

      <ToolsStack.Screen
        name="AppointmentScheduler"
        component={AppointmentSchedulerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Appointments",
        }}
      />

      <ToolsStack.Screen
        name="PressureReliefTimer"
        component={PressureReliefTimerScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Pressure Relief",
        }}
      />

      <ToolsStack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Emergency Contacts",
        }}
      />

      <ToolsStack.Screen
        name="NZSpinalTrust"
        component={NZSpinalTrustScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "New Zealand Spinal Trust",
        }}
      />
    </ToolsStack.Navigator>
  );
}

/* ───────────────── settings stack ───────────────── */

function SettingsStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <SettingsStack.Navigator screenOptions={screenOptions}>
      <SettingsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: () => (
            <HeaderTitle title="Settings" />
          ),
        }}
      />

      <SettingsStack.Screen
        name="DisplaySettings"
        component={DisplaySettingsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Display",
        }}
      />
    </SettingsStack.Navigator>
  );
}

/* ───────────────── profile stack ───────────────── */

function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => (
            <HeaderTitle title="Profile" />
          ),
        }}
      />
    </ProfileStack.Navigator>
  );
}

/* ───────────────── tabs navigator ───────────────── */

export default function RootTabsNavigator() {
  const { isDark } = useTheme();

  // Use theme-aware colors for tab bar
  const tabColors = isDark ? Colors.dark : Colors.light;
  const activeColor = tabColors.tabIconSelected;
  const inactiveColor = tabColors.tabIconDefault;
  const backgroundColor = tabColors.backgroundDefault;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopColor: tabColors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="home"
              size={size}
              color={color}
              accessible={true}
              accessibilityLabel="Home Tab"
            />
          ),
        }}
      />

      <Tab.Screen
        name="ToolsTab"
        component={ToolsStackNavigator}
        options={{
          title: "Tools",
          tabBarLabel: "Tools",
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="tool"
              size={size}
              color={color}
              accessible={true}
              accessibilityLabel="Tools Tab"
            />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="settings"
              size={size}
              color={color}
              accessible={true}
              accessibilityLabel="Settings Tab"
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="user"
              size={size}
              color={color}
              accessible={true}
              accessibilityLabel="Profile Tab"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
