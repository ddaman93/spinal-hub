import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { getChairById } from "@/data/manualWheelchairChairs";

type RouteProps = RouteProp<MainStackParamList, "ManualWheelchairDetail">;

export default function ManualWheelchairDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const { theme } = useTheme();

  const chair = getChairById(params.productId);

  if (!chair) {
    return (
      <ThemedView style={[styles.notFound, { paddingBottom: insets.bottom }]}>
        <ThemedText type="small" style={{ opacity: 0.6 }}>
          Chair not found.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* IMAGE */}
        <Image
          source={chair.image ? { uri: chair.image } : undefined}
          style={[styles.image, { backgroundColor: theme.backgroundTertiary }]}
          contentFit="contain"
        />

        <View style={styles.content}>
          {/* LINE LABEL */}
          <ThemedText type="caption" style={[styles.lineLabel, { color: theme.textSecondary }]}>
            {chair.manufacturerLine}
          </ThemedText>

          {/* TITLE */}
          <ThemedText type="h4">{chair.title}</ThemedText>

          <ThemedText type="caption" style={{ opacity: 0.7 }}>
            {chair.description}
          </ThemedText>

          {/* WHAT THIS IS */}
          {chair.whatItIs && (
            <View style={styles.section}>
              <ThemedText type="small" style={styles.sectionHeading}>What this is</ThemedText>
              <ThemedText type="small" style={styles.sectionText}>{chair.whatItIs}</ThemedText>
            </View>
          )}

          {/* WHAT THIS DOES */}
          {chair.whatItDoes && (
            <View style={styles.section}>
              <ThemedText type="small" style={styles.sectionHeading}>What this does</ThemedText>
              <ThemedText type="small" style={styles.sectionText}>{chair.whatItDoes}</ThemedText>
            </View>
          )}

          {/* WHO IT'S FOR */}
          {chair.whoItsFor && (
            <View style={styles.section}>
              <ThemedText type="small" style={styles.sectionHeading}>Who it's for</ThemedText>
              <ThemedText type="small" style={styles.sectionText}>{chair.whoItsFor}</ThemedText>
            </View>
          )}

          {/* PRODUCT LINK */}
          {chair.productUrl && (
            <Pressable
              style={[styles.linkButton, { backgroundColor: theme.primary }]}
              onPress={() => Linking.openURL(chair.productUrl)}
              accessible
              accessibilityRole="link"
              accessibilityLabel={`Visit ${chair.title} product page`}
            >
              <ThemedText type="small" style={[styles.linkButtonText, { color: theme.buttonText }]}>
                Visit Product Page
              </ThemedText>
              <Feather name="external-link" size={16} color={theme.buttonText} />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  lineLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  section: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  sectionHeading: {
    fontWeight: "600",
  },
  sectionText: {
    opacity: 0.8,
    lineHeight: 22,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.md,
  },
  linkButtonText: {
    fontWeight: "600",
  },
});
