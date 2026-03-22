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
import { getSpecialtyChairById } from "@/data/specialtyWheelchairs";

type RouteProps = RouteProp<MainStackParamList, "SpecialtyWheelchairDetail">;

const SPECIALTY_TYPE_LABELS: Record<string, string> = {
  "shower-commode": "Shower / Commode",
  "beach":          "Beach",
  "suspension":     "Suspension",
  "tilt-in-space":  "Tilt-in-Space",
};

export default function SpecialtyWheelchairDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();
  const { theme } = useTheme();

  const chair = getSpecialtyChairById(params.productId);

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
          {/* TYPE LABEL */}
          <ThemedText
            type="caption"
            style={[styles.typeLabel, { color: theme.textSecondary }]}
          >
            {SPECIALTY_TYPE_LABELS[chair.specialtyType] ?? chair.specialtyType}
          </ThemedText>

          {/* TITLE */}
          <ThemedText type="h4">{chair.title}</ThemedText>

          {/* DESCRIPTION */}
          <ThemedText type="caption" style={{ opacity: 0.8, lineHeight: 22 }}>
            {chair.description}
          </ThemedText>

          {/* PRODUCT LINK */}
          {chair.url ? (
            <Pressable
              style={[styles.linkButton, { backgroundColor: theme.primary }]}
              onPress={() => Linking.openURL(chair.url)}
              accessible
              accessibilityRole="link"
              accessibilityLabel={`View ${chair.title} product page`}
            >
              <ThemedText
                type="small"
                style={[styles.linkButtonText, { color: theme.buttonText }]}
              >
                Visit Product Page
              </ThemedText>
              <Feather name="external-link" size={16} color={theme.buttonText} />
            </Pressable>
          ) : null}
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
    height: 220,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  typeLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.8,
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
