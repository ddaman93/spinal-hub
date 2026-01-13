import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type RouteProps = RouteProp<
  MainStackParamList,
  "ProductDetail"
>;

export default function ProductDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const product = params.product;

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
          source={{ uri: product.image }}
          style={styles.image}
          contentFit="cover"
        />

        <View style={styles.content}>
          <ThemedText type="h2">
            {product.title}
          </ThemedText>

          <ThemedText
            type="small"
            style={{ opacity: 0.7 }}
          >
            {product.description}
          </ThemedText>

          {/* Placeholder for future */}
          <ThemedText type="heading" style={{ marginTop: Spacing.lg }}>
            Things to know
          </ThemedText>
          <ThemedText>
            Funding, compatibility, and setup details vary.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#000",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
});