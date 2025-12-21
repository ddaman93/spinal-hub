import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from "react-native-svg";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

const DEFAULT_INTERVAL_MINUTES = 20;
const INTERVAL_OPTIONS = [15, 20, 30];
const STORAGE_KEY = "pressureReliefTimerState";

const RING_SIZE = 220;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PressureReliefTimerScreen() {
  const [durationMinutes, setDurationMinutes] = useState(
    DEFAULT_INTERVAL_MINUTES
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    DEFAULT_INTERVAL_MINUTES * 60
  );
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================
     RESTORE STATE
     ========================= */
  useEffect(() => {
    const restoreState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const parsed: {
          durationMinutes: number;
          remainingSeconds: number;
          isRunning: boolean;
          lastUpdatedAt: number;
        } = JSON.parse(stored);

        const savedDuration =
          parsed.durationMinutes ?? DEFAULT_INTERVAL_MINUTES;

        setDurationMinutes(savedDuration);

        if (parsed.isRunning && parsed.lastUpdatedAt) {
          const elapsedSeconds = Math.floor(
            (Date.now() - parsed.lastUpdatedAt) / 1000
          );

          const updatedRemaining =
            parsed.remainingSeconds - elapsedSeconds;

          if (updatedRemaining > 0) {
            setRemainingSeconds(updatedRemaining);
            setIsRunning(true);
          } else {
            setRemainingSeconds(savedDuration * 60);
            setIsRunning(false);
          }
        } else {
          setRemainingSeconds(parsed.remainingSeconds);
          setIsRunning(false);
        }
      } catch {}
    };

    restoreState();
  }, []);

  /* =========================
     TIMER LOOP
     ========================= */
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return durationMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, durationMinutes]);

  /* =========================
     PERSIST STATE
     ========================= */
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            durationMinutes,
            remainingSeconds,
            isRunning,
            lastUpdatedAt: Date.now(),
          })
        );
      } catch {}
    };

    saveState();
  }, [durationMinutes, remainingSeconds, isRunning]);

  /* =========================
     HANDLERS
     ========================= */
  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(durationMinutes * 60);
  };

  const totalSeconds = durationMinutes * 60;
  const progress = remainingSeconds / totalSeconds;
  const strokeDashoffset =
    CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  /* =========================
     RENDER
     ========================= */
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="h2">Pressure Relief</ThemedText>

        <ThemedText type="body" style={styles.description}>
          Regular pressure relief helps protect skin and improve circulation.
        </ThemedText>

        {/* Interval Selector */}
        <View style={styles.intervalSelector}>
          {INTERVAL_OPTIONS.map((minutes) => {
            const isSelected = minutes === durationMinutes;

            return (
              <Pressable
                key={minutes}
                onPress={() => {
                  setIsRunning(false);
                  setDurationMinutes(minutes);
                  setRemainingSeconds(minutes * 60);
                }}
                style={[
                  styles.intervalButton,
                  isSelected && styles.intervalButtonActive,
                ]}
              >
                <ThemedText type="heading">
                  {minutes} min
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              stroke="rgba(0,0,0,0.1)"
              fill="none"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              stroke="#007AFF"
              fill="none"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>

          <View style={styles.timeOverlay}>
            <ThemedText type="h1">{formattedTime}</ThemedText>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={handleStartPause}
            style={styles.primaryButton}
          >
            <ThemedText type="heading">
              {isRunning ? "Pause" : "Start"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleReset}
            style={styles.secondaryButton}
          >
            <ThemedText type="heading">Reset</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

/* =========================
   STYLES
   ========================= */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  description: { opacity: 0.8 },

  intervalSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  intervalButtonActive: {
    backgroundColor: "#007AFF",
  },

  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timeOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  controls: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});