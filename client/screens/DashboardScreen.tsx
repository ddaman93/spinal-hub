import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CategoryTile } from "@/components/CategoryTile";
import { VoiceButton } from "@/components/VoiceButton";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { useTheme } from "@/hooks/useTheme";

type Category = {
  id: string;
  title: string;
  icon: "sun" | "activity" | "users" | "calendar" | "briefcase" | "tool";
};

const categories: Category[] = [
  { id: "daily-routine", title: "Daily Routine", icon: "sun" },
  { id: "health-tracking", title: "Health Tracking", icon: "activity" },
  { id: "care-support", title: "Care & Support", icon: "users" },
  { id: "appointments", title: "Appointments", icon: "calendar" },
  { id: "life-management", title: "Life Management", icon: "briefcase" },
  { id: "custom-tools", title: "Custom Tools", icon: "tool" },
];

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [isListening, setIsListening] = useState(false);

  const handleCategoryPress = useCallback((category: Category) => {
    Speech.speak(`Opening ${category.title}`);
    navigation.navigate("CategoryDetail", {
      category: category.id,
      title: category.title,
    });
  }, [navigation]);

  const handleVoicePress = useCallback(() => {
    setIsListening((prev) => {
      const newState = !prev;
      if (newState) {
        Speech.speak("Listening for your command");
      } else {
        Speech.speak("Voice control stopped");
      }
      return newState;
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              title={category.title}
              icon={category.icon}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>
      </ScrollView>

      {isListening ? (
        <View
          style={[
            styles.voiceStatusBar,
            {
              bottom: insets.bottom + Spacing.xl + 100,
              backgroundColor: theme.backgroundSecondary,
            },
          ]}
        >
          <ThemedText type="body">Listening...</ThemedText>
        </View>
      ) : null}

      <VoiceButton
        isListening={isListening}
        onPress={handleVoicePress}
        style={{
          position: "absolute",
          bottom: insets.bottom + Spacing.xl,
          alignSelf: "center",
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  voiceStatusBar: {
    position: "absolute",
    left: Spacing.xl,
    right: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: "center",
  },
});
