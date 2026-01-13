import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

/* ───────────────────────── screen ───────────────────────── */

export default function MobilityAssistiveTechScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MainStackParamList>
    >();

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <ThemedView style={styles.container}>
      <View
        style={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading">
            Mobility & Wheelchair Tech
          </ThemedText>

          <ThemedText
            type="small"
            style={{ opacity: 0.7 }}
          >
            Assistive technology to improve mobility, reduce
            fatigue, and increase independence for wheelchair users.
          </ThemedText>
        </View>

        {/* MANUAL WHEELCHAIR */}
        <TechOptionCard
          title="Manual Wheelchair Tech"
          description="Power assist, handcycles, propulsion aids, and shoulder protection."
          onPress={() =>
            navigation.navigate(
              "ManualWheelchairTech"
            )
          }
        />

        {/* POWER WHEELCHAIR */}
        <TechOptionCard
          title="Power Wheelchair Tech"
          description="Controls, seating, mounts, positioning, and access solutions."
          onPress={() =>
            navigation.navigate(
              "PowerWheelchairTech"
            )
          }
        />
      </View>
    </ThemedView>
  );
}

/* ───────────────────────── option card ───────────────────────── */

function TechOptionCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
    >
      <ThemedText type="h3">
        {title}
      </ThemedText>

      <ThemedText
        type="caption"
        style={{ opacity: 0.7 }}
      >
        {description}
      </ThemedText>
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

  card: {
    padding: Spacing.lg,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    gap: Spacing.xs,
  },
});