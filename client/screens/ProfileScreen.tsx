import React, { useState, useCallback, useLayoutEffect, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
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
import { useTour } from "@/context/TourContext";
import { TourTarget } from "@/components/TourTarget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserProfile, UserRole } from "@/types/user";
import { MainStackParamList } from "@/types/navigation";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type RoleOption = { role: UserRole; icon: React.ComponentProps<typeof Feather>["name"]; label: string; color: string };
const ROLE_OPTIONS: RoleOption[] = [
  { role: "sci_patient",         icon: "user",      label: "SCI Patient",         color: "#5B8DEF" },
  { role: "caregiver",           icon: "heart",     label: "Caregiver",           color: "#00E676" },
  { role: "health_professional", icon: "briefcase", label: "Health Professional", color: "#AF52DE" },
  { role: "family_member",       icon: "users",     label: "Family Member",       color: "#FF9800" },
];

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
  const { registerScrollRef } = useTour();
  const scrollRef = useRef<ScrollView>(null);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    registerScrollRef("ProfileTab", scrollRef);
  }, [registerScrollRef]);

  async function changeRole(role: UserRole) {
    if (role === currentRole) return;
    setSavingRole(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      setCurrentRole(role);
    } catch {
      Alert.alert("Error", "Could not update role. Please try again.");
    } finally {
      setSavingRole(false);
    }
  }

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
      getToken().then((token) => {
        if (!token) return;
        fetch(`${getApiUrl()}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.ok ? r.json() : null)
          .then((p) => { if (p?.role) setCurrentRole(p.role as UserRole); })
          .catch(() => {});
      });
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.md,
        }}
      >
        <TourTarget stepId="profile-overview" scrollRef={scrollRef}>
          <ProfileHeader
            name={user.name}
            subtitle={user.injuryLevel}
            onEditPress={() => navigation.navigate("EditProfile")}
          />
        </TourTarget>

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

        {/* Role switcher */}
        <ProfileSection title="My Role">
          <View style={{ paddingVertical: Spacing.sm }}>
            <ThemedText type="caption" style={{ opacity: 0.5, marginBottom: Spacing.md }}>
              Change if you selected the wrong role during setup.
            </ThemedText>
            <View style={roleStyles.grid}>
              {ROLE_OPTIONS.map((opt) => {
                const active = currentRole === opt.role;
                return (
                  <Pressable
                    key={opt.role}
                    onPress={() => changeRole(opt.role)}
                    disabled={savingRole}
                    style={({ pressed }) => [
                      roleStyles.card,
                      {
                        backgroundColor: active ? opt.color + "22" : "transparent",
                        borderColor: active ? opt.color : "rgba(128,128,128,0.2)",
                        borderWidth: active ? 2 : 1,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Feather name={opt.icon} size={20} color={active ? opt.color : theme.textSecondary} />
                    <ThemedText
                      type="caption"
                      style={{ fontWeight: active ? "700" : "400", color: active ? opt.color : theme.text, marginTop: 6, textAlign: "center" }}
                      numberOfLines={2}
                    >
                      {opt.label}
                    </ThemedText>
                    {active && savingRole && (
                      <ActivityIndicator size="small" color={opt.color} style={{ marginTop: 4 }} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
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

const roleStyles = RNStyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "47%", alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.medium, minHeight: 80,
  },
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
