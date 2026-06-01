import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "./ThemedText";

const PALETTE: Array<[string, string]> = [
  ["#FF6B6B", "#EE5A6F"],
  ["#4ECDC4", "#44A08D"],
  ["#667EEA", "#764BA2"],
  ["#F093FB", "#F5576C"],
  ["#5EE7DF", "#B490CA"],
  ["#FAD961", "#F76B1C"],
  ["#30CFD0", "#330867"],
  ["#A8EDEA", "#FED6E3"],
  ["#FBC2EB", "#A6C1EE"],
  ["#FDBB2D", "#22C1C3"],
  ["#3A1C71", "#FFAF7B"],
  ["#16A085", "#F4D03F"],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

type Props = {
  name: string;
  size?: number;
  style?: ViewStyle;
};

export function Avatar({ name, size = 32, style }: Props) {
  const safe = name?.trim() || "?";
  const initial = safe.charAt(0).toUpperCase();
  const colors = PALETTE[hash(safe) % PALETTE.length];

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <ThemedText style={[styles.text, { fontSize: size * 0.42 }]}>
        {initial}
      </ThemedText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
});
