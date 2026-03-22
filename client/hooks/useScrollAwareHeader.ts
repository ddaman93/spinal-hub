import { useCallback } from "react";
import { Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useHeaderScroll } from "@/context/HeaderScrollContext";

/**
 * Call this in any screen that has a ScrollView to get a scroll-aware header.
 * Spread the returned object onto your ScrollView:
 *
 *   const scrollProps = useScrollAwareHeader();
 *   <ScrollView {...scrollProps} ...>
 */
export function useScrollAwareHeader() {
  const { scrollY } = useHeaderScroll();

  // Reset to transparent whenever this screen gains focus so navigating
  // to a fresh screen never shows a stale "scrolled" header.
  useFocusEffect(
    useCallback(() => {
      scrollY.setValue(0);
    }, [scrollY]),
  );

  return {
    onScroll: Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false },
    ),
    scrollEventThrottle: 16,
  };
}
