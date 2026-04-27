import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation, StackActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/constants/hooks/useScreenOptions";
import { useTheme } from "@/constants/hooks/useTheme";
import { MainStackParamList } from "@/types/navigation";

import DashboardScreen from "@/screens/DashboardScreen";
import ToolsScreen from "@/screens/ToolsScreen";
import CategoryDetailScreen from "@/screens/CategoryDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import DisplaySettingsScreen from "@/screens/DisplaySettingsScreen";
import NotificationSettingsScreen from "@/screens/NotificationSettingsScreen";
import AccessibilitySettingsScreen from "@/screens/AccessibilitySettingsScreen";
import DataBackupScreen from "@/screens/DataBackupScreen";
import AboutScreen from "@/screens/AboutScreen";
import HealthDefaultsScreen from "@/screens/HealthDefaultsScreen";
import FeedbackScreen from "@/screens/FeedbackScreen";
import FeatureTourScreen from "@/screens/onboarding/FeatureTourScreen";
import CommunityChatScreen from "@/screens/CommunityChatScreen";
import BackOnTrackScreen from "@/screens/BackOnTrackScreen";
import ChatRoomScreen from "@/screens/ChatRoomScreen";
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
import SkinCheckLogScreen from "@/screens/tools/SkinCheckLogScreen";
import BladderLogScreen from "@/screens/tools/BladderLogScreen";
import CarePreferencesScreen from "@/screens/tools/CarePreferencesScreen";
import AutonomicDysreflexiaScreen from "@/screens/tools/AutonomicDysreflexiaScreen";
import SkinCareScreen from "@/screens/SkinCareScreen";
import NZSpinalTrustScreen from "@/screens/NZSpinalTrustScreen";
import CcsDisabilityActionScreen from "@/screens/CcsDisabilityActionScreen";
import SpinalRehabUnitsScreen from "@/screens/SpinalRehabUnitsScreen";
import MentalHealthResourcesScreen from "@/screens/MentalHealthResourcesScreen";
import SCIMedicationsScreen from "@/screens/tools/SCIMedicationsScreen";
import SCIMedicationDetailScreen from "@/screens/tools/SCIMedicationDetailScreen";
import MobilityTaxiListScreen from "@/screens/MobilityTaxiListScreen";
import MobilityTaxiDetailScreen from "@/screens/MobilityTaxiDetailScreen";
import AccessibleTransportMapScreen from "@/screens/AccessibleTransportMapScreen";
import CarerCompanyListScreen from "@/screens/CarerCompanyListScreen";
import CarerCompanyDetailScreen from "@/screens/CarerCompanyDetailScreen";
import SCIProviderDetailScreen from "@/screens/SCIProviderDetailScreen";

import AssistiveTechListScreen from "@/screens/AssistiveTechListScreen";
import AssistiveTechDetailScreen from "@/screens/AssistiveTechDetailScreen";
import AllAssistiveTechScreen from "@/screens/AllAssistiveTechScreen";

import ClinicalTrialsListScreen from "@/screens/ClinicalTrialsListScreen";
import ClinicalTrialDetailScreen from "@/screens/ClinicalTrialDetailScreen";

import MobilityAssistiveTechScreen from "@/screens/MobilityAssistiveTechScreen";
import ManualWheelchairTechScreen from "@/screens/ManualWheelchairTechScreen";
import WheelchairGloveBrandScreen from "@/screens/WheelchairGloveBrandScreen";
import PowerWheelchairTechScreen from "@/screens/PowerWheelchairTechScreen";
import AllWheelchairsScreen from "@/screens/AllWheelchairsScreen";
import ManualWheelchairsBrandScreen from "@/screens/ManualWheelchairsBrandScreen";
import ManualWheelchairDetailScreen from "@/screens/ManualWheelchairDetailScreen";
import AlternativeMiceCategoryScreen from "@/screens/AlternativeMiceCategoryScreen";
import AlternativeMiceProductsScreen from "@/screens/AlternativeMiceProductsScreen";
import PowerWheelchairsBrandScreen from "@/screens/PowerWheelchairsBrandScreen";
import PowerWheelchairDetailScreen from "@/screens/PowerWheelchairDetailScreen";
import SportsWheelchairsBrandScreen from "@/screens/SportsWheelchairsBrandScreen";
import SportsWheelchairDetailScreen from "@/screens/SportsWheelchairDetailScreen";
import SpecialtyWheelchairsBrandScreen from "@/screens/SpecialtyWheelchairsBrandScreen";
import SpecialtyWheelchairDetailScreen from "@/screens/SpecialtyWheelchairDetailScreen";
import AirlineWheelchairsBrandScreen from "@/screens/AirlineWheelchairsBrandScreen";
import AirlineWheelchairDetailScreen from "@/screens/AirlineWheelchairDetailScreen";
import ProductDetailScreen from "@/screens/ProductDetailScreen";

import ProfileScreen from "@/screens/ProfileScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import EmergencyCardScreen from "@/screens/EmergencyCardScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { ThemeSwitchButton } from "@/components/ThemeSwitchButton";
import AnimatedGlassTabBar from "@/components/AnimatedGlassTabBar";

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
        name="AllWheelchairs"
        component={AllWheelchairsScreen}
        options={{ title: "Wheelchairs" }}
      />

      <HomeStack.Screen
        name="ManualWheelchairsBrand"
        component={ManualWheelchairsBrandScreen}
        options={({ route }) => ({
          title:
            route.params.brandId.charAt(0).toUpperCase() +
            route.params.brandId.slice(1) +
            " Manual Chairs",
        })}
      />

      <HomeStack.Screen
        name="ManualWheelchairDetail"
        component={ManualWheelchairDetailScreen}
        options={{ title: "Chair Details" }}
      />

      <HomeStack.Screen
        name="ManualWheelchairTech"
        component={ManualWheelchairTechScreen}
        options={{ title: "Manual Wheelchair Tech" }}
      />

      <HomeStack.Screen
        name="WheelchairGloveBrand"
        component={WheelchairGloveBrandScreen}
        options={({ route }) => ({
          title:
            route.params.brandId
              .split("-")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ") + " Gloves",
        })}
      />

      <HomeStack.Screen
        name="PowerWheelchairTech"
        component={PowerWheelchairTechScreen}
        options={{ title: "Power Wheelchair Tech" }}
      />

      <HomeStack.Screen
        name="PowerWheelchairsBrand"
        component={PowerWheelchairsBrandScreen}
        options={({ route }) => ({
          title:
            route.params.brandId
              .split("-")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ") + " Power Chairs",
        })}
      />

      <HomeStack.Screen
        name="PowerWheelchairDetail"
        component={PowerWheelchairDetailScreen}
        options={{ title: "Chair Details" }}
      />

      <HomeStack.Screen
        name="SportsWheelchairsBrand"
        component={SportsWheelchairsBrandScreen}
        options={({ route }) => ({
          title:
            route.params.brandId.charAt(0).toUpperCase() +
            route.params.brandId.slice(1) +
            " Sports",
        })}
      />

      <HomeStack.Screen
        name="SportsWheelchairDetail"
        component={SportsWheelchairDetailScreen}
        options={{ title: "Chair Details" }}
      />

      <HomeStack.Screen
        name="SpecialtyWheelchairsBrand"
        component={SpecialtyWheelchairsBrandScreen}
        options={({ route }) => ({
          title:
            route.params.brandId.charAt(0).toUpperCase() +
            route.params.brandId.slice(1) +
            " Specialty",
        })}
      />

      <HomeStack.Screen
        name="SpecialtyWheelchairDetail"
        component={SpecialtyWheelchairDetailScreen}
        options={{ title: "Chair Details" }}
      />

      <HomeStack.Screen
        name="AirlineWheelchairsBrand"
        component={AirlineWheelchairsBrandScreen}
        options={({ route }) => ({
          title:
            route.params.brandId.charAt(0).toUpperCase() +
            route.params.brandId.slice(1) +
            " Airline",
        })}
      />

      <HomeStack.Screen
        name="AirlineWheelchairDetail"
        component={AirlineWheelchairDetailScreen}
        options={{ title: "Chair Details" }}
      />

<HomeStack.Screen
        name="AlternativeMiceCategory"
        component={AlternativeMiceCategoryScreen}
        options={{ title: "Alternative Mice" }}
      />

      <HomeStack.Screen
        name="AlternativeMiceProducts"
        component={AlternativeMiceProductsScreen}
        options={({ route }) => ({
          title: route.params.initialSubcategory
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        })}
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

      <ToolsStack.Screen
        name="CcsDisabilityAction"
        component={CcsDisabilityActionScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "CCS Disability Action",
        }}
      />

      {/* SCI MEDICATIONS */}
      <ToolsStack.Screen
        name="SCIMedications"
        component={SCIMedicationsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "SCI Medications",
        }}
      />

      <ToolsStack.Screen
        name="SCIMedicationDetail"
        component={SCIMedicationDetailScreen}
        options={({ route }) => ({
          ...opaqueScreenOptions,
          headerTitle: route.params.name,
        })}
      />

      {/* MOBILITY TAXIS */}
      <ToolsStack.Screen
        name="MobilityTaxiList"
        component={MobilityTaxiListScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Mobility Taxis",
        }}
      />

      <ToolsStack.Screen
        name="MobilityTaxiDetail"
        component={MobilityTaxiDetailScreen}
        options={({ route: _ }) => ({
          ...opaqueScreenOptions,
          headerTitle: "Taxi Details",
        })}
      />

      {/* ACCESSIBLE TRANSPORT MAP */}
      <ToolsStack.Screen
        name="AccessibleTransportMap"
        component={AccessibleTransportMapScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Accessible Transport Map",
        }}
      />

      {/* CARER COMPANIES */}
      <ToolsStack.Screen
        name="CarerCompanyList"
        component={CarerCompanyListScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Carer Companies",
        }}
      />

      <ToolsStack.Screen
        name="CarerCompanyDetail"
        component={CarerCompanyDetailScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Provider Details",
        }}
      />

      <ToolsStack.Screen
        name="SCIProviderDetail"
        component={SCIProviderDetailScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Provider Details",
        }}
      />

      {/* SPINAL REHAB UNITS */}
      <ToolsStack.Screen
        name="SpinalRehabUnits"
        component={SpinalRehabUnitsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Spinal Rehab Units",
        }}
      />

      {/* MENTAL HEALTH RESOURCES */}
      <ToolsStack.Screen
        name="MentalHealthResources"
        component={MentalHealthResourcesScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Mental Health Resources",
        }}
      />

      {/* SKIN CHECK LOG */}
      <ToolsStack.Screen
        name="SkinCheckLog"
        component={SkinCheckLogScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Skin Check Log",
        }}
      />

      {/* BLADDER LOG */}
      <ToolsStack.Screen
        name="BladderLog"
        component={BladderLogScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Bladder Log",
        }}
      />

      {/* CARE PREFERENCES */}
      <ToolsStack.Screen
        name="AutonomicDysreflexia"
        component={AutonomicDysreflexiaScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Autonomic Dysreflexia",
        }}
      />

      <ToolsStack.Screen
        name="CarePreferences"
        component={CarePreferencesScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Care Preferences",
        }}
      />

      {/* SKIN CARE */}
      <ToolsStack.Screen
        name="SkinCare"
        component={SkinCareScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Skin Care",
        }}
      />

      {/* BACK ON TRACK */}
      <ToolsStack.Screen
        name="BackOnTrack"
        component={BackOnTrackScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Back on Track",
        }}
      />

      {/* COMMUNITY CHAT */}
      <ToolsStack.Screen
        name="CommunityChat"
        component={CommunityChatScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Community",
        }}
      />

      <ToolsStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          ...opaqueScreenOptions,
          headerTitle: route.params.channelName,
        })}
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

      <SettingsStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Notifications",
        }}
      />

      <SettingsStack.Screen
        name="AccessibilitySettings"
        component={AccessibilitySettingsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Accessibility",
        }}
      />

      <SettingsStack.Screen
        name="DataBackup"
        component={DataBackupScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Data & Backup",
        }}
      />

      <SettingsStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "About",
        }}
      />

      <SettingsStack.Screen
        name="HealthDefaults"
        component={HealthDefaultsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Health Defaults",
        }}
      />

      <SettingsStack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Send Feedback",
        }}
      />

      <SettingsStack.Screen
        name="FeatureTour"
        component={FeatureTourScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "App Tour",
        }}
      />
    </SettingsStack.Navigator>
  );
}

/* ───────────────── profile stack ───────────────── */

function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="Dashboard"
        component={ProfileScreen}
        options={{
          headerTitle: () => (
            <HeaderTitle title="Profile" />
          ),
        }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Edit Profile" }}
      />
      <ProfileStack.Screen
        name="EmergencyCard"
        component={EmergencyCardScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Emergency Medical Card" }}
      />
    </ProfileStack.Navigator>
  );
}

/* ───────────────── tabs navigator ───────────────── */

export default function RootTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <AnimatedGlassTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Feather
              name="home"
              size={19}
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
          tabBarIcon: ({ color }) => (
            <Feather
              name="tool"
              size={19}
              color={color}
              accessible={true}
              accessibilityLabel="Tools Tab"
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const toolsTab = state.routes[state.index];
            if (toolsTab?.name !== "ToolsTab") return;
            const stackIndex = toolsTab.state?.index ?? 0;
            if (stackIndex > 0) {
              e.preventDefault();
              navigation.navigate("ToolsTab" as never, { screen: "Tools" } as never);
            }
          },
        })}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <Feather
              name="settings"
              size={19}
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
          tabBarIcon: ({ color }) => (
            <Feather
              name="user"
              size={19}
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
