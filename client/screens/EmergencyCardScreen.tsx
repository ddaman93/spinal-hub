import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { EmergencyCard } from "@/components/EmergencyCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserProfile } from "@/types/user";
import { PROFILE_STORAGE_KEY, DEFAULT_USER } from "@/screens/ProfileScreen";

const ACCENT = "#D32F2F";

export default function EmergencyCardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [fullScreen, setFullScreen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((raw) => {
        if (raw) setProfile(JSON.parse(raw));
      });
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.md,
        }}
      >
        {/* Instructions */}
        <View style={[styles.notice, { backgroundColor: "#FFF3F3", borderColor: "#FFCDD2" }]}>
          <Feather name="info" size={16} color={ACCENT} style={{ marginTop: 2 }} />
          <ThemedText type="small" style={styles.noticeText}>
            Show this card to first responders or caregivers in an emergency. Tap "Full Screen" for
            maximum visibility.
          </ThemedText>
        </View>

        <EmergencyCard profile={profile} />

        {/* Full screen button */}
        <Pressable
          onPress={() => setFullScreen(true)}
          style={({ pressed }) => [
            styles.fullScreenBtn,
            { borderColor: ACCENT, opacity: pressed ? 0.7 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Show full screen emergency card"
        >
          <Feather name="maximize-2" size={18} color={ACCENT} />
          <ThemedText type="body" style={[styles.fullScreenText, { color: ACCENT }]}>
            Show Full Screen
          </ThemedText>
        </Pressable>

        {/* Edit hint */}
        <ThemedText type="small" style={[styles.editHint, { color: theme.textSecondary }]}>
          To update this card, edit your profile.
        </ThemedText>
      </ScrollView>

      {/* Full-screen modal */}
      <Modal
        visible={fullScreen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFullScreen(false)}
      >
        <SafeAreaView style={[styles.fullModal, { backgroundColor: ACCENT }]}>
          {/* Close */}
          <Pressable
            onPress={() => setFullScreen(false)}
            style={styles.closeBtn}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close full screen"
          >
            <Feather name="x" size={26} color="#fff" />
          </Pressable>

          <ScrollView
            contentContainerStyle={styles.fullScroll}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="small" style={styles.fullHeader}>
              EMERGENCY MEDICAL CARD
            </ThemedText>

            {/* Name */}
            {profile.name ? (
              <View style={styles.fullSection}>
                <ThemedText style={styles.fullLabel}>NAME</ThemedText>
                <ThemedText style={styles.fullName}>{profile.name}</ThemedText>
              </View>
            ) : null}

            <FullRow label="INJURY LEVEL" value={profile.injuryLevel} />
            <FullRow label="INJURY TYPE" value={profile.injuryType} />
            <FullRow label="MEDICATIONS" value={profile.medications} />
            <FullRow label="ALLERGIES" value={profile.allergies} />
            <FullRow
              label="EMERGENCY CONTACT"
              value={
                profile.emergencyContactName && profile.emergencyContactPhone
                  ? `${profile.emergencyContactName}\n${profile.emergencyContactPhone}`
                  : profile.emergencyContact
              }
            />
            <FullRow label="NOTES FOR PARAMEDICS" value={profile.medicalNotes} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

function FullRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.fullSection}>
      <ThemedText style={styles.fullLabel}>{label}</ThemedText>
      <ThemedText style={styles.fullValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notice: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeText: {
    flex: 1,
    color: "#B71C1C",
    lineHeight: 20,
  },
  fullScreenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderRadius: BorderRadius.medium,
    height: 52,
  },
  fullScreenText: {
    fontWeight: "700",
    fontSize: 17,
  },
  editHint: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontSize: 13,
  },
  // Full-screen modal
  fullModal: {
    flex: 1,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: Spacing.lg,
  },
  fullScroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  fullHeader: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: Spacing.xl,
  },
  fullSection: {
    marginBottom: Spacing.xl,
  },
  fullLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  fullName: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
  },
  fullValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 36,
  },
});
