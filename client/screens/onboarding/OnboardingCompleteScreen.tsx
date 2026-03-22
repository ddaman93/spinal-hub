import React, { useEffect } from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PROFILE_STORAGE_KEY } from "@/screens/ProfileScreen";
import { OnboardingStackParamList, triggerOnboardingComplete } from "@/navigation/OnboardingStack";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";
import * as Location from "expo-location";
import { detectRegion } from "@/utils/detectRegion";

export const ONBOARDING_COMPLETE_KEY = "spinal_hub_onboarding_complete";

export default function OnboardingCompleteScreen() {
  const route = useRoute<RouteProp<OnboardingStackParamList, "OnboardingComplete">>();
  const { theme } = useTheme();
  const { draft } = route.params;

  // Save profile data immediately so it's ready when the app loads
  useEffect(() => {
    const save = async () => {
      // Auto-detect location from GPS (best-effort)
      let detectedLocation = draft.location ?? "";
      if (!detectedLocation) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            detectedLocation = detectRegion(pos.coords.latitude, pos.coords.longitude);
          }
        } catch {
          // Location unavailable — leave blank
        }
      }

      const profile = {
        id: String(Date.now()),
        role: draft.role ?? "",
        name: draft.name ?? "",
        email: draft.email ?? "",
        phone: draft.phone ?? "",
        location: detectedLocation,
        injuryLevel: draft.injuryLevel ?? "",
        injuryType: draft.injuryType ?? "",
        injuryDate: draft.injuryDate ?? "",
        rehabCentre: draft.rehabCentre ?? "",
        wheelchairType: draft.wheelchairType ?? "",
        wheelchairModel: draft.wheelchairModel ?? "",
        assistiveTech: draft.assistiveTech ?? "",
        assistiveTechList: draft.assistiveTechList ?? [],
        emergencyContact: draft.emergencyContact ?? "",
        emergencyContactName: draft.emergencyContactName ?? "",
        emergencyContactPhone: draft.emergencyContactPhone ?? "",
        careCompanies: draft.careCompanies ?? "",
        caregiverNotes: draft.careNotes ?? "",
        careNotes: draft.careNotes ?? "",
        medications: draft.medications ?? "",
        allergies: draft.allergies ?? "",
        medicalNotes: draft.medicalNotes ?? "",
      };
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

      // Persist to server (best-effort — don't block onboarding if server is unreachable)
      try {
        const token = await getToken();
        if (token) {
          await fetch(`${getApiUrl()}/api/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(profile),
          });
        }
      } catch {
        // Server sync failed — local copy is the source of truth for now
      }
    };
    save();
  }, []);

  const handleEnter = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    triggerOnboardingComplete();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <ThemedText type="h1" style={styles.title}>
          You're all set!
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your profile is saved. You can update any details at any time from the Profile tab.
        </ThemedText>

        {/* Summary chips */}
        <View style={styles.chips}>
          {[
            draft.injuryLevel && `Level: ${draft.injuryLevel}`,
            draft.wheelchairType && draft.wheelchairType,
            draft.name && draft.name,
          ]
            .filter(Boolean)
            .map((item) => (
              <View
                key={item as string}
                style={[styles.chip, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              >
                <ThemedText type="small" style={{ color: theme.text, fontWeight: "600" }}>
                  {item}
                </ThemedText>
              </View>
            ))}
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.backgroundRoot }]}>
        <Pressable
          onPress={handleEnter}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Enter Spinal Hub"
        >
          <ThemedText type="body" style={styles.buttonText}>
            Enter Spinal Hub
          </ThemedText>
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 26,
    marginBottom: Spacing.xl,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.medium,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
