import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { MainStackParamList } from "@/types/navigation";

type RouteProps = RouteProp<
  MainStackParamList,
  "AssistiveTechDetail"
>;

export default function AssistiveTechDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();

  const item = ASSISTIVE_TECH_ITEMS.find(
    (i) => i.id === params.itemId
  );

  if (!item) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Item not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: item.heroImageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />

        <View style={styles.content}>
          {/* Title */}
          <ThemedText type="h2">
            {item.title}
          </ThemedText>

          {/* Tags */}
          <View style={styles.tags}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <ThemedText type="caption">
                  {tag.replace("-", " ")}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Description */}
          <ThemedText type="heading" style={styles.sectionTitle}>
            What it is
          </ThemedText>
          <ThemedText>
            {item.summary}
          </ThemedText>

          {/* Placeholder sections (safe now, expandable later) */}
          <ThemedText type="heading" style={styles.sectionTitle}>
            Who it’s for
          </ThemedText>
          <ThemedText>
            Information will be added as this section grows.
          </ThemedText>

          <ThemedText type="heading" style={styles.sectionTitle}>
            Things to know
          </ThemedText>
          <ThemedText>
            Compatibility, limitations, and setup details vary.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: 240,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});