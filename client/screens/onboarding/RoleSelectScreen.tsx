import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList, OnboardingDraft } from "@/navigation/OnboardingStack";
import { UserRole } from "@/types/user";

type RoleOption = {
  role: UserRole;
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description: string;
};

const ROLES: RoleOption[] = [
  { role: "sci_patient",          icon: "user",      title: "SCI Patient",         description: "I have a spinal cord injury" },
  { role: "caregiver",            icon: "heart",     title: "Caregiver",           description: "I support someone with SCI" },
  { role: "health_professional",  icon: "briefcase", title: "Health Professional", description: "I work in SCI healthcare" },
  { role: "family_member",        icon: "users",     title: "Family Member",       description: "I have a family member with SCI" },
];

export default function RoleSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<RouteProp<OnboardingStackParamList, "RoleSelect">>();
  const { theme, isDark } = useTheme();
  const draft: OnboardingDraft = route.params?.draft ?? {};

  function handleSelect(role: UserRole) {
    const next: OnboardingDraft = { ...draft, role };
    if (role === "sci_patient") {
      navigation.navigate("InjuryDetails", { draft: next });
    } else {
      navigation.navigate("PersonalSetup", { draft: next });
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Feather name="user-check" size={32} color={theme.primary} style={styles.icon} />
        <ThemedText type="h2" style={styles.title}>Who are you?</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Select your role so we can personalise your experience.
        </ThemedText>

        {ROLES.map((item) => (
          <Pressable
            key={item.role}
            onPress={() => handleSelect(item.role)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: isDark
                  ? "rgba(0, 230, 100, 0.06)"
                  : theme.backgroundDefault,
                borderColor: isDark
                  ? "rgba(0, 230, 100, 0.2)"
                  : theme.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(0,230,100,0.12)" : theme.backgroundSecondary }]}>
              <Feather name={item.icon} size={26} color={theme.primary} />
            </View>
            <View style={styles.cardText}>
              <ThemedText type="body" style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                {item.title}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.description}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  icon: { marginBottom: Spacing.sm },
  title: { marginBottom: Spacing.sm },
  subtitle: { marginBottom: Spacing.xl, fontSize: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: { flex: 1 },
  cardTitle: { fontWeight: "700", fontSize: 16, marginBottom: 2 },
  cardTitleDark: { color: "#FFFFFF" },
});
