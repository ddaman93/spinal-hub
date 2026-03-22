import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type Product = {
  id: string;
  title: string;
  description: string;
  image: any;
  whatItIs?: string;
  whatItDoes?: string;
  whoItsFor?: string;
  productUrl?: string;
  contentFit?: "cover" | "contain";
  imageBackground?: string;
};

export function ProductCard({ product, compact = false, imageBackground }: { product: Product; compact?: boolean; imageBackground?: string }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.card, compact && styles.cardCompact, { backgroundColor: theme.backgroundDefault }]}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          product,
        })
      }
    >
      <Image source={product.image} style={[styles.image, compact && styles.imageCompact, { backgroundColor: imageBackground ?? product.imageBackground ?? theme.backgroundTertiary }]} contentFit={product.contentFit ?? "contain"} />

      <View style={[styles.content, compact && styles.contentCompact]}>
        <ThemedText type="small" style={compact ? { fontSize: 13 } : undefined}>{product.title}</ThemedText>

        <ThemedText type="caption" numberOfLines={2} style={[{ color: theme.textSecondary }, compact && { fontSize: 11 }]}>
          {product.description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 16,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 120,
  },

  content: {
    padding: Spacing.md,
    gap: 6,
  },

  cardCompact: {
    width: 155,
    height: 145,
  },

  imageCompact: {
    height: 68,
  },

  contentCompact: {
    padding: 9,
    gap: 3,
    flex: 1,
  },
});
