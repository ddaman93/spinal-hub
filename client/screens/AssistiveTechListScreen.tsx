import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { Spacing } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "@/types/navigation";

export default function AssistiveTechListScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ThemedText type="h2">Assistive Technology</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Tools and equipment that improve independence
          </ThemedText>
        </View>

        {ASSISTIVE_TECH_ITEMS.map((item) => (
          <AssistiveTechCard
            key={item.id}
            item={item}
            onPress={() =>
              navigation.navigate("AssistiveTechDetail", {
                itemId: item.id,
              })
            }
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
});