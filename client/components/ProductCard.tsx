import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MainStackParamList>
    >();

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          product,
        })
      }
    >
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.content}>
        <ThemedText type="small">
          {product.title}
        </ThemedText>

        <ThemedText
          type="caption"
          numberOfLines={2}
          style={{ opacity: 0.7 }}
        >
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
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#000",
  },

  content: {
    padding: Spacing.md,
    gap: 6,
  },
});