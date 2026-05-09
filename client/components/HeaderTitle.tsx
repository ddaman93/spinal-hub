import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";

interface HeaderTitleProps {
  title?: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  if (!title) {
    return (
      <Image
        source={require("../../assets/images/logo-header.png")}
        style={styles.wordmark}
        resizeMode="contain"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo-mark.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  wordmark: {
    width: 240,
    height: 36,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
});
