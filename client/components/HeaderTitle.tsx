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
    width: 280,
    height: 62,
  },
  icon: {
    width: 48,
    height: 48,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
