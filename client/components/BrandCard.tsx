import React from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { MainStackParamList } from "@/types/navigation";
import type { ManualWheelchairBrand } from "@/data/manualWheelchairProducts";

export function BrandCard({ brand }: { brand: ManualWheelchairBrand }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
      onPress={() =>
        brand.externalUrl
          ? Linking.openURL(brand.externalUrl)
          : navigation.navigate("WheelchairGloveBrand", { brandId: brand.id })
      }
      accessible
      accessibilityRole="button"
      accessibilityLabel={`View ${brand.title} gloves`}
    >
      <Image
        source={brand.image}
        style={[styles.image, { backgroundColor: theme.backgroundTertiary }]}
        contentFit={brand.contentFit ?? "cover"}
      />
      <View style={styles.content}>
        <ThemedText type="small" style={styles.title}>
          {brand.title}
        </ThemedText>
        <ThemedText
          type="caption"
          numberOfLines={2}
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {brand.description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 88,
  },
  content: {
    padding: 10,
    gap: 4,
  },
  title: {
    fontSize: 13,
  },
  description: {
    fontSize: 11,
  },
});
