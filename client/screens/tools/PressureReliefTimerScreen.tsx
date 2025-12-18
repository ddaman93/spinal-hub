import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "pressureReliefTimerState";
const DEFAULT_INTERVAL_MINUTES = 20;

export default function PressureReliefTimerScreen() {
  const [durationMinutes] = useState(DEFAULT_INTERVAL_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState(
    DEFAULT_INTERVAL_MINUTES * 60
  );
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const parsed = JSON.parse(stored);
        const { remainingSeconds: storedSeconds, isRunning: storedRunning, lastUpdatedAt } = parsed;

        if (storedRunning && lastUpdatedAt) {
          const elapsedSeconds = Math.floor(
            (Date.now() - lastUpdatedAt) / 1000
          );

          const updatedRemaining = storedSeconds - elapsedSeconds;

          if (updatedRemaining > 0) {
            setRemainingSeconds(updatedRemaining);
            setIsRunning(true);
          } else {
            setRemainingSeconds(DEFAULT_INTERVAL_MINUTES * 60);
            setIsRunning(false);
          }
        } else {
          setRemainingSeconds(storedSeconds);
          setIsRunning(false);
        }
      } catch (e) {
        // If restore fails, fall back to defaults
      }
    };

    restoreState();
  }, []);

  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            remainingSeconds,
            isRunning,
            lastUpdatedAt: Date.now(),
          })
        );
      } catch (e) {
        // Silent fail — persistence should never break the timer
      }
    };

    saveState();
  }, [remainingSeconds, isRunning]);

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

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(durationMinutes * 60);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="h2">Pressure Relief</ThemedText>

        <ThemedText type="body" style={styles.description}>
          Regular pressure relief helps protect skin and improve circulation.
        </ThemedText>

        <View style={styles.timer}>
          <ThemedText type="h1">{formattedTime}</ThemedText>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={handleStartPause}
            style={[
              styles.primaryButton,
              isRunning && styles.primaryButtonActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
          >
            <ThemedText type="button">
              {isRunning ? "Pause" : "Start"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleReset}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
          >
            <ThemedText type="button">Reset</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  description: {
    opacity: 0.8,
  },
  timer: {
    height: 180,
    borderRadius: BorderRadius.large,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
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
  primaryButtonActive: {
    opacity: 0.85,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});
