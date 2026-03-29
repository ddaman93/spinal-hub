import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const BRAND_COLOR = "#6B4FA2";

const CRISIS_LINES = [
  {
    id: "1737",
    name: "1737 — Need to Talk?",
    phone: "1737",
    description:
      "Free call or text 1737 anytime to talk with a trained counsellor. Available 24/7.",
    website: "https://1737.org.nz",
  },
  {
    id: "lifeline",
    name: "Lifeline NZ",
    phone: "0800 543 354",
    description:
      "24/7 crisis support and suicide prevention helpline.",
    website: "https://www.lifeline.org.nz",
  },
  {
    id: "samaritans",
    name: "Samaritans",
    phone: "0800 726 666",
    description:
      "Free, confidential support any time of the day or night.",
    website: "https://www.samaritans.org.nz",
  },
];

const SCI_SUPPORT = [
  {
    id: "nz-spinal-trust",
    name: "NZ Spinal Trust",
    phone: "0800 000 050",
    description:
      "Peer support and counselling for people living with SCI — connecting you with others who understand.",
    website: "https://nzspinaltrust.org.nz",
  },
  {
    id: "mental-health-foundation",
    name: "Mental Health Foundation NZ",
    phone: null,
    description:
      "Resources, tools, and information for mental wellbeing.",
    website: "https://mentalhealth.org.nz",
  },
];

async function openURL(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open this link");
    }
  } catch (error) {
    console.error("Error opening URL:", error);
    Alert.alert("Error", "Something went wrong opening this link");
  }
}

type Resource = {
  id: string;
  name: string;
  phone: string | null;
  description: string;
  website: string;
};

function ResourceCard({
  resource,
  theme,
}: {
  resource: Resource;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.cardContent}>
        <ThemedText type="h4" style={{ color: theme.text }}>
          {resource.name}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.bodyText, { color: theme.textSecondary }]}
        >
          {resource.description}
        </ThemedText>
        <View style={styles.buttonRow}>
          {resource.phone && (
            <Pressable
              onPress={() =>
                openURL(`tel:${resource.phone!.replace(/\s/g, "")}`)
              }
              style={({ pressed }) => [
                styles.callButton,
                { backgroundColor: "#1A8A3C", opacity: pressed ? 0.8 : 1 },
              ]}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Call ${resource.name}`}
            >
              <Feather name="phone" size={16} color="#FFFFFF" />
              <ThemedText
                type="body"
                style={[styles.buttonText, { color: "#FFFFFF" }]}
              >
                Call {resource.phone}
              </ThemedText>
            </Pressable>
          )}
          <Pressable
            onPress={() => openURL(resource.website)}
            style={({ pressed }) => [
              styles.websiteButton,
              {
                borderColor: BRAND_COLOR,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Visit ${resource.name} website`}
          >
            <Feather name="external-link" size={16} color={BRAND_COLOR} />
            <ThemedText
              type="body"
              style={[styles.buttonText, { color: BRAND_COLOR }]}
            >
              Visit Website
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function MentalHealthResourcesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* HEADER CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
            styles.headerCard,
          ]}
        >
          <View
            style={[styles.headerAccent, { backgroundColor: BRAND_COLOR }]}
          />
          <View style={styles.cardContent}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              Mental Health Resources
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              Support lines &amp; SCI-specific help
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.bodyText, { color: theme.textSecondary }]}
            >
              Mental health challenges — including depression, anxiety, and
              grief — are very common after a spinal cord injury. Reaching out
              for support is a sign of strength, not weakness. These services
              are free and available to you.
            </ThemedText>
          </View>
        </View>

        {/* CRISIS SUPPORT SECTION */}
        <View style={styles.sectionHeader}>
          <Feather name="alert-circle" size={20} color={BRAND_COLOR} />
          <ThemedText type="h4" style={{ color: theme.text }}>
            Crisis Support
          </ThemedText>
        </View>

        {CRISIS_LINES.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} theme={theme} />
        ))}

        {/* SCI & DISABILITY SUPPORT SECTION */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.sm }]}>
          <Feather name="heart" size={20} color={BRAND_COLOR} />
          <ThemedText type="h4" style={{ color: theme.text }}>
            SCI &amp; Disability Support
          </ThemedText>
        </View>

        {SCI_SUPPORT.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} theme={theme} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  headerCard: {
    position: "relative",
  },
  headerAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  headerSubtitle: {
    marginTop: Spacing.xs,
    lineHeight: 24,
  },
  bodyText: {
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  buttonRow: {
    flexDirection: "column",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 48,
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1.5,
    minHeight: 48,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
