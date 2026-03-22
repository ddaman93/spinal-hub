import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  name: string;
  subtitle: string;
  photo?: string;
  onEditPress: () => void;
};

export function ProfileHeader({ name, subtitle, photo, onEditPress }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          shadowColor: theme.text,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

      <View style={styles.content}>
        {/* Avatar */}
        <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="user" size={36} color={theme.primary} />
            </View>
          )}
        </View>

        {/* Name + subtitle */}
        <ThemedText type="h3" style={styles.name}>
          {name}
        </ThemedText>
        <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </ThemedText>

        {/* Edit button */}
        <Pressable
          onPress={onEditPress}
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
        >
          <Feather name="edit-2" size={14} color="#FFFFFF" />
          <ThemedText type="small" style={styles.editLabel}>
            Edit Profile
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.large,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  accentBar: {
    height: 6,
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
    overflow: "hidden",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: -4,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  editLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
