import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { triggerOnboardingComplete } from "@/navigation/OnboardingStack";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Slide = {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    id: "welcome",
    icon: "zap",
    color: "#00E676",
    title: "Welcome to Spinal Hub",
    body: "Your all-in-one companion designed specifically for the SCI community. Here's a quick look at what you can do.",
  },
  {
    id: "tools",
    icon: "tool",
    color: "#FF9500",
    title: "Health & Wellness Tools",
    body: "Track vitals, log pain levels, set pressure relief reminders, manage medications, and build daily routines — all in one place.",
  },
  {
    id: "wheelchairs",
    icon: "monitor",
    color: "#007AFF",
    title: "Wheelchairs & Assistive Tech",
    body: "Browse manual and power wheelchairs, sports chairs, airline chairs, gloves, and computer accessibility gear with links to buy.",
  },
  {
    id: "research",
    icon: "activity",
    color: "#AF52DE",
    title: "Clinical Trials & Research",
    body: "Stay up to date with the latest SCI clinical trials and scientific news from around the world.",
  },
  {
    id: "community",
    icon: "message-circle",
    color: "#5B8DEF",
    title: "Community Chat",
    body: "Connect with others in the SCI community. Share experiences, ask questions, and find support across dedicated topic channels.",
  },
  {
    id: "resources",
    icon: "briefcase",
    color: "#34C759",
    title: "Resources & Support",
    body: "Access NZ Spinal Trust, ACC guidance, carer companies, mobility taxis, spinal rehab units, and mental health resources.",
  },
];

export default function FeatureTourScreen() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      triggerOnboardingComplete();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + "22" }]}>
              <Feather name={item.icon} size={52} color={item.color} />
            </View>
            <ThemedText type="h1" style={styles.title}>
              {item.title}
            </ThemedText>
            <ThemedText type="body" style={[styles.body, { color: theme.textSecondary }]}>
              {item.body}
            </ThemedText>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? theme.primary : theme.border,
                width: i === activeIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Footer buttons */}
      <View style={[styles.footer, { backgroundColor: theme.backgroundRoot }]}>
        {!isLast && (
          <Pressable
            onPress={triggerOnboardingComplete}
            style={styles.skipBtn}
            accessibilityRole="button"
            accessibilityLabel="Skip tour"
          >
            <ThemedText type="body" style={[styles.skipText, { color: theme.textSecondary }]}>
              Skip
            </ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
            isLast && styles.nextBtnFull,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get started" : "Next"}
        >
          <ThemedText style={styles.nextText}>
            {isLast ? "Get Started" : "Next"}
          </ThemedText>
          <Feather name={isLast ? "check" : "arrow-right"} size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 25,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  skipBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    fontWeight: "500",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.medium,
  },
  nextBtnFull: {
    flex: 1,
  },
  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
});
