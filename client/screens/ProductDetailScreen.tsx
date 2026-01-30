import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type RouteProps = RouteProp<MainStackParamList, "ProductDetail">;

export default function ProductDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const product = params.product;

  const handleOpenLink = () => {
    if (product.productUrl) {
      Linking.openURL(product.productUrl);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        {/* IMAGE */}
        <Image
          source={product.image}
          style={[styles.image, { backgroundColor: theme.backgroundTertiary }]}
          contentFit="cover"
        />

        <View style={styles.content}>
          {/* TITLE */}
          <ThemedText type="h4">{product.title}</ThemedText>

          <ThemedText type="caption" style={{ opacity: 0.7 }}>
            {product.description}
          </ThemedText>

          {/* WHAT THIS IS */}
          {product.whatItIs && (
            <View style={styles.section}>
              <ThemedText type="small" style={styles.sectionHeading}>What this is</ThemedText>
              <ThemedText type="small" style={styles.sectionText}>
                {product.whatItIs}
              </ThemedText>
            </View>
          )}

          {/* WHAT THIS DOES */}
          {product.whatItDoes && (
            <View style={styles.section}>
              <ThemedText type="small" style={styles.sectionHeading}>What this does</ThemedText>
              <ThemedText type="small" style={styles.sectionText}>
                {product.whatItDoes}
              </ThemedText>
            </View>
          )}

          {/* WHO IT'S FOR */}
          {product.whoItsFor && (
            <View style={styles.section}>
              <ThemedText type="small" style={styles.sectionHeading}>Who it's for</ThemedText>
              <ThemedText type="small" style={styles.sectionText}>
                {product.whoItsFor}
              </ThemedText>
            </View>
          )}

          {/* PRODUCT LINK */}
          {product.productUrl && (
            <Pressable
              style={[styles.linkButton, { backgroundColor: theme.primary }]}
              onPress={handleOpenLink}
              accessible
              accessibilityRole="link"
              accessibilityLabel={`Visit ${product.title} product page`}
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
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
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