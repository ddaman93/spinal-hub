import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserProfile } from "@/types/user";

const ACCENT = "#D32F2F";

type Props = {
  profile: Partial<UserProfile>;
  compact?: boolean;
};

function Row({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Feather name={icon} size={15} color={ACCENT} />
      </View>
      <View style={styles.rowText}>
        <ThemedText type="small" style={styles.rowLabel}>
          {label.toUpperCase()}
        </ThemedText>
        <ThemedText type="body" style={styles.rowValue}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

export function EmergencyCard({ profile, compact }: Props) {
  const emergencyContact =
    profile.emergencyContactName && profile.emergencyContactPhone
      ? `${profile.emergencyContactName} — ${profile.emergencyContactPhone}`
      : profile.emergencyContact;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Header */}
      <View style={[styles.header, compact && styles.headerCompact]}>
        <Feather name="alert-triangle" size={compact ? 18 : 22} color="#fff" />
        <ThemedText
          type={compact ? "small" : "h4"}
          style={[styles.headerTitle, compact && styles.headerTitleCompact]}
        >
          EMERGENCY MEDICAL CARD
        </ThemedText>
      </View>

      {/* Body */}
      <View style={[styles.body, compact && styles.bodyCompact]}>
        {/* Name */}
        {profile.name ? (
          <View style={[styles.nameBlock, compact && styles.nameBlockCompact]}>
            <ThemedText type="small" style={styles.nameLabel}>NAME</ThemedText>
            <ThemedText
              type={compact ? "h4" : "h3"}
              style={styles.nameValue}
            >
              {profile.name}
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.divider, { backgroundColor: "#e0e0e0" }]} />

        <Row icon="activity" label="Injury Level" value={profile.injuryLevel} />
        <Row icon="info" label="Injury Type" value={profile.injuryType} />
        <Row icon="pill" label="Medications" value={profile.medications} />
        <Row icon="alert-circle" label="Allergies" value={profile.allergies} />
        <Row icon="phone" label="Emergency Contact" value={emergencyContact} />
        <Row icon="file-text" label="Notes for Paramedics" value={profile.medicalNotes} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.large,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: "#fff",
  },
  cardCompact: {
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerCompact: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerTitleCompact: {
    fontSize: 12,
  },
  body: {
    padding: Spacing.lg,
  },
  bodyCompact: {
    padding: Spacing.md,
  },
  nameBlock: {
    marginBottom: Spacing.md,
  },
  nameBlockCompact: {
    marginBottom: Spacing.sm,
  },
  nameLabel: {
    color: ACCENT,
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 2,
  },
  nameValue: {
    fontWeight: "700",
    color: "#111",
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  rowIcon: {
    width: 24,
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  rowValue: {
    color: "#222",
    fontSize: 15,
    fontWeight: "500",
  },
});
