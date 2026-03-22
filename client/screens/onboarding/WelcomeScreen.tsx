import React from "react";
import { View, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingStack";

const FEATURES = [
  { icon: "grid" as const, text: "Browse assistive equipment and wheelchairs" },
  { icon: "tool" as const, text: "Track medications, hydration, and routines" },
  { icon: "map-pin" as const, text: "Find accessible transport and services" },
  { icon: "alert-triangle" as const, text: "Store an emergency medical card" },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Title */}
        <ThemedText type="h1" style={styles.title}>
          Welcome to{"\n"}Spinal Hub
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          A toolkit built for spinal cord injury life.
        </ThemedText>

        {/* Features */}
        <View style={[styles.featureCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name={f.icon} size={18} color={theme.primary} />
              </View>
              <ThemedText type="body" style={[styles.featureText, { color: theme.text }]}>
                {f.text}
              </ThemedText>
            </View>
          ))}
        </View>

        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Takes about 2 minutes. You can skip any field.
        </ThemedText>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.footer, { backgroundColor: theme.backgroundRoot }]}>
        <Pressable
          onPress={() => navigation.navigate("RoleSelect", { draft: {} })}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <ThemedText type="body" style={styles.buttonText}>
            Get Started
          </ThemedText>
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 42,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    fontSize: 18,
  },
  featureCard: {
    width: "100%",
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 16,
  },
  hint: {
    textAlign: "center",
    fontSize: 13,
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
