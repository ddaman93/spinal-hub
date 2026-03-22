import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useScrollAwareHeader } from "@/hooks/useScrollAwareHeader";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { ALTERNATIVE_MICE_SUBCATEGORIES, AlternativeMiceSubcategory } from "@/data/computerProductivityProducts";

/* ───────────────────────── screen ───────────────────────── */

export default function AlternativeMiceCategoryScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MainStackParamList>
    >();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollProps = useScrollAwareHeader();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        {...scrollProps}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.screenTitle}>
            Alternative Mice
          </ThemedText>

          <ThemedText
            type="small"
            style={{ opacity: 0.7 }}
          >
            Ergonomic mice, trackballs, joysticks, head-mounted devices, and adaptive mouse solutions for accessible computer control.
          </ThemedText>
        </View>

        {/* SUBCATEGORY CARDS */}
        {ALTERNATIVE_MICE_SUBCATEGORIES.map((subcategory) => (
          <SubcategoryCard
            key={subcategory.id}
            title={subcategory.title}
            description={subcategory.description}
            image={subcategory.image}
            onPress={() =>
              navigation.navigate("AlternativeMiceProducts", {
                initialSubcategory: subcategory.id,
              })
            }
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────────────── subcategory card ───────────────────────── */

function SubcategoryCard({
  title,
  description,
  image,
  onPress,
}: {
  title: string;
  description: string;
  image: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
    >
      <Image
        source={{ uri: image }}
        style={styles.cardImage}
        resizeMode="cover"
      />

      <View style={styles.cardContent}>
        <ThemedText type="h3">
          {title}
        </ThemedText>

        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary }}
        >
          {description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },

  screenTitle: {
    fontSize: 22,
    lineHeight: 26,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 120,
  },

  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
});
