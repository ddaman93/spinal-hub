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
};

export function ProductCard({ product }: { product: Product }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          product,
        })
      }
    >
      <Image source={product.image} style={[styles.image, { backgroundColor: theme.backgroundTertiary }]} contentFit="cover" />

      <View style={styles.content}>
        <ThemedText type="small">{product.title}</ThemedText>

        <ThemedText type="caption" numberOfLines={2} style={{ color: theme.textSecondary }}>
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
});
