import React from "react";
import { View, ScrollView, Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type Props = {
  title: string;
  items: any[];
  navigation: any;
  route: keyof MainStackParamList;
};

export function AssistiveTechLane({
  title,
  items,
  navigation,
  route,
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <View style={{ marginTop: Spacing.md }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: Spacing.xs,
        }}
      >
        <ThemedText
          type="small"
          style={{ opacity: 0.8 }}
        >
          {title}
        </ThemedText>

        {/* onPress lives HERE */}
        <Pressable
          onPress={() => navigation.navigate(route)}
          hitSlop={8}
        >
          <ThemedText type="link">
            View all →
          </ThemedText>
        </Pressable>
      </View>

      {/* CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.md }}
      >
        {items.slice(0, 6).map((item) => (
          <AssistiveTechCard
            key={item.id}
            item={item}
            variant="carousel"
          />
        ))}
      </ScrollView>
    </View>
  );
}