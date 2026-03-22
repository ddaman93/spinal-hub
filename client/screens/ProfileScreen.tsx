import React, { useState, useCallback, useLayoutEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { View, Pressable, StyleSheet as RNStyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileItem } from "@/components/profile/ProfileItem";
import { useTheme } from "@/hooks/useTheme";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserProfile } from "@/types/user";
import { MainStackParamList } from "@/types/navigation";

export const PROFILE_STORAGE_KEY = "user_profile";

export const DEFAULT_USER: UserProfile = {
  id: "1",
  name: "",
  email: "",
  phone: "",
  location: "",
  injuryLevel: "",
  injuryType: "",
  injuryDate: "",
  rehabCentre: "",
  wheelchairType: "",
  wheelchairModel: "",
  assistiveTech: "",
  assistiveTechList: [],
  emergencyContact: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  careCompanies: "",
  caregiverNotes: "",
  careNotes: "",
  medications: "",
  allergies: "",
  medicalNotes: "",
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const scrollProps = useScrollAwareHeader();
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={signOut}
          style={({ pressed }) => [
            signOutStyles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Feather name="log-out" size={14} color="#fff" />
          <ThemedText style={signOutStyles.label}>Sign Out</ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
        if (raw) setUser(JSON.parse(raw));
      });
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.md,
        }}
      >
        <ProfileHeader
          name={user.name}
          subtitle={user.injuryLevel}
          onEditPress={() => navigation.navigate("EditProfile")}
        />

        <ProfileSection title="Basic Info">
          <ProfileItem icon="mail" label="Email" value={user.email} />
          <ProfileItem icon="phone" label="Phone" value={user.phone} />
          <ProfileItem icon="map-pin" label="Location" value={user.location} isLast />
        </ProfileSection>

        <ProfileSection title="Injury Details">
          <ProfileItem icon="activity" label="Injury Level" value={user.injuryLevel} />
          <ProfileItem icon="calendar" label="Injury Date" value={user.injuryDate} />
          <ProfileItem icon="home" label="Rehab Centre" value={user.rehabCentre} isLast />
        </ProfileSection>

        <ProfileSection title="Mobility">
          <ProfileItem icon="disc" label="Wheelchair Type" value={user.wheelchairType} />
          <ProfileItem icon="tag" label="Wheelchair Model" value={user.wheelchairModel} isLast />
        </ProfileSection>

        <ProfileSection title="Care & Support">
          <ProfileItem icon="alert-circle" label="Emergency Contact" value={user.emergencyContact} />
          <ProfileItem icon="users" label="Care Companies" value={user.careCompanies} />
          <ProfileItem icon="file-text" label="Caregiver Notes" value={user.caregiverNotes} isLast />
        </ProfileSection>

        {/* Emergency Medical Card */}
        <Pressable
          onPress={() => navigation.navigate("EmergencyCard")}
          style={({ pressed }) => [
            emergencyCardStyles.button,
            { borderColor: "#D32F2F", opacity: pressed ? 0.7 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open Emergency Medical Card"
        >
          <View style={emergencyCardStyles.iconWrap}>
            <Feather name="alert-triangle" size={22} color="#fff" />
          </View>
          <View style={emergencyCardStyles.text}>
            <ThemedText type="body" style={emergencyCardStyles.title}>
              Emergency Medical Card
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Show to first responders in an emergency
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#D32F2F" />
        </Pressable>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

const signOutStyles = RNStyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 4,
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

const emergencyCardStyles = RNStyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { flex: 1 },
  title: { fontWeight: "700", color: "#D32F2F" },
});
