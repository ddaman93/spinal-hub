import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import Svg, { Rect, Defs, Mask } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTour, TOUR_STEPS } from "@/context/TourContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SPOT_PAD = 10;
const SPOT_RADIUS = 18;
const TOOLTIP_H = 170;
const TOOLTIP_MARGIN = 14;

export function SpotlightOverlay() {
  const { isActive, measurement, stepIndex, nextStep, endTour } = useTour();
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && measurement) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, measurement]);

  if (!isActive) return null;

  const step = TOUR_STEPS[stepIndex];
  if (!step) return null;

  const isLast = stepIndex === TOUR_STEPS.length - 1;

  // Spotlight rect (with padding around the target)
  const spot = measurement
    ? {
        x: measurement.x - SPOT_PAD,
        y: measurement.y - SPOT_PAD,
        w: measurement.width + SPOT_PAD * 2,
        h: measurement.height + SPOT_PAD * 2,
      }
    : null;

  // Tooltip position — prefer below the spotlight, fall back to above
  let tooltipTop = 0;
  if (spot) {
    const spaceBelow = SCREEN_H - (spot.y + spot.h);
    const showAbove =
      step.tooltipSide === "above" || spaceBelow < TOOLTIP_H + TOOLTIP_MARGIN + 16;
    tooltipTop = showAbove
      ? spot.y - TOOLTIP_H - TOOLTIP_MARGIN
      : spot.y + spot.h + TOOLTIP_MARGIN;
  }

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      {/* Touch blocker — blocks taps on the app underneath */}
      <View style={StyleSheet.absoluteFillObject} />

      {/* SVG dark overlay with spotlight cutout */}
      {spot && (
        <Svg
          width={SCREEN_W}
          height={SCREEN_H}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        >
          <Defs>
            <Mask id="spotlight">
              <Rect width={SCREEN_W} height={SCREEN_H} fill="white" />
              <Rect
                x={spot.x}
                y={spot.y}
                width={spot.w}
                height={spot.h}
                rx={SPOT_RADIUS}
                ry={SPOT_RADIUS}
                fill="black"
              />
            </Mask>
          </Defs>
          <Rect
            width={SCREEN_W}
            height={SCREEN_H}
            fill="rgba(0,0,0,0.78)"
            mask="url(#spotlight)"
          />
        </Svg>
      )}

      {/* Glowing border around spotlight */}
      {spot && (
        <View
          style={[
            styles.spotBorder,
            {
              left: spot.x - 2,
              top: spot.y - 2,
              width: spot.w + 4,
              height: spot.h + 4,
              borderColor: theme.primary,
              borderRadius: SPOT_RADIUS + 2,
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Tooltip card */}
      {spot && (
        <View
          style={[
            styles.tooltip,
            {
              top: tooltipTop,
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Step counter + progress dots */}
          <View style={styles.tooltipTop}>
            <ThemedText style={[styles.stepCounter, { color: theme.primary }]}>
              {stepIndex + 1} of {TOUR_STEPS.length}
            </ThemedText>
            <View style={styles.dots}>
              {TOUR_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === stepIndex ? theme.primary : theme.border,
                      width: i === stepIndex ? 16 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <ThemedText style={styles.tooltipTitle}>{step.title}</ThemedText>

          <ThemedText style={[styles.tooltipBody, { color: theme.textSecondary }]}>
            {step.description}
          </ThemedText>

          <View style={styles.actions}>
            <Pressable onPress={endTour} style={styles.skipBtn}>
              <ThemedText
                style={[styles.skipText, { color: theme.textSecondary }]}
              >
                Skip tour
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={isLast ? endTour : nextStep}
              style={[styles.nextBtn, { backgroundColor: theme.primary }]}
            >
              <ThemedText style={styles.nextText}>
                {isLast ? "Done  ✓" : "Next →"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  spotBorder: {
    position: "absolute",
    borderWidth: 2,
  },
  tooltip: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  tooltipTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  tooltipBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  skipBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  nextBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.medium,
  },
  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
