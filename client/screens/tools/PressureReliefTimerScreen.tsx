import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from "react-native-svg";
import * as Notifications from "expo-notifications";
import { Feather } from "@expo/vector-icons";


import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";

/* ─── constants ─── */

const DEFAULT_HOLD_SECONDS = 30;
const TIMER_OPTIONS = [30, 60];
const REMINDER_OPTIONS = [20, 30, 45, 60];
const TIMER_STORAGE_KEY = "pressureReliefTimerState";
const REMINDER_STORAGE_KEY = "pressureReliefReminderId";
const REMINDER_SCHEDULED_AT_KEY = "pressureReliefReminderScheduledAt";

const RING_SIZE = 150;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ACCENT = "#007AFF";

/* ─── technique data ─── */

const TECHNIQUES = [
  {
    key: "forward-lean",
    title: "Forward Lean",
    description:
      "Lean forward so your chest moves toward your knees. This removes pressure from both sitting bones simultaneously. Hold for at least 30 seconds.",
    images: [
      { uri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/tools/forward_lean.jpg" },
    ],
  },
  {
    key: "side-lean",
    title: "Side Lean",
    description:
      "Lean your body to one side, hooking your arm around the push handle or using a surface for support, to lift one buttock fully off the cushion. Hold for 30–90 seconds, then repeat on the other side.",
    images: [
      { uri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/tools/side-lean_2.jpg" },
      { uri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/tools/side-lean_table.jpg" },
    ],
  },
  {
    key: "alternative",
    title: "Alternative Methods",
    description:
      "If you are unable to perform a push-up lift, you may use a combination of leaning techniques, ask a caregiver to assist you with lifting or repositioning, or use a mechanical lift. The goal is the same — fully relieve pressure from both sitting bones.",
    images: [
      { uri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/tools/alterative.jpg" },
    ],
  },
  {
    key: "power-tilt",
    title: "Power Tilt",
    description:
      "If your power wheelchair has a tilt function, tilt the entire seat backwards to at least 45 degrees. This shifts your weight off the sitting bones onto your back. Hold for at least 1–2 minutes for effective pressure relief.",
    images: [
      { uri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/tools/Power-Tilt.jpg" },
    ],
  },
  {
    key: "power-recline",
    title: "Power Recline",
    description:
      "If your chair has a recline function, recline the backrest to reduce the angle between your seat and back. This redistributes pressure from your sitting bones across a larger surface area. Used alone, recline may cause shear — combine with tilt for best results.",
    images: [
      { uri: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/tools/power-recline.jpg" },
    ],
  },
];

/* ─── notification helpers ─── */

async function cancelReminder() {
  try {
    const stored = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
    if (stored) {
      await Notifications.cancelScheduledNotificationAsync(stored);
    }
  } catch {}
  await AsyncStorage.removeItem(REMINDER_STORAGE_KEY);
}

async function scheduleReminder(intervalMinutes: number): Promise<boolean> {
  if (Platform.OS === "web") return false;
  await cancelReminder();

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for a pressure relief",
      body: "Preventing pressure injuries keeps you healthy. Tap to open the guide.",
      data: { screen: "PressureReliefTimer" },
    },
    trigger: {
      // "timeInterval" is the string value of SchedulableTriggerInputTypes.TIME_INTERVAL
      type: "timeInterval" as any,
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });

  await AsyncStorage.setItem(REMINDER_STORAGE_KEY, id);
  return true;
}

/* ─── screen ─── */

export default function PressureReliefTimerScreen() {
  const { theme } = useTheme();

  /* timer state */
  const [durationSeconds, setDurationSeconds] = useState(DEFAULT_HOLD_SECONDS);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_HOLD_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* reminder state */
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(30);
  /* load default reminder interval from preferences */
  useEffect(() => {
    storage.preferences.get().then((prefs) => {
      if (prefs.pressureReliefIntervalMinutes) {
        setReminderInterval(prefs.pressureReliefIntervalMinutes);
      }
    });
  }, []);
  const [reminderScheduledAt, setReminderScheduledAt] = useState<number | null>(null);
  const [reminderCountdown, setReminderCountdown] = useState<number | null>(null);

  /* ── restore timer state ── */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (!stored) return;
        const parsed: {
          durationSeconds: number;
          remainingSeconds: number;
          isRunning: boolean;
          lastUpdatedAt: number;
        } = JSON.parse(stored);

        const savedDuration = parsed.durationSeconds ?? DEFAULT_HOLD_SECONDS;
        setDurationSeconds(savedDuration);

        if (parsed.isRunning && parsed.lastUpdatedAt) {
          const elapsed = Math.floor((Date.now() - parsed.lastUpdatedAt) / 1000);
          const updated = parsed.remainingSeconds - elapsed;
          if (updated > 0) {
            setRemainingSeconds(updated);
            setIsRunning(true);
          } else {
            setRemainingSeconds(savedDuration);
          }
        } else {
          setRemainingSeconds(parsed.remainingSeconds);
        }
      } catch {}
    })();
  }, []);

  /* ── restore reminder state ── */
  useEffect(() => {
    (async () => {
      try {
        const id = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
        if (!id) return;
        // Check if the notification is still scheduled
        const all = await Notifications.getAllScheduledNotificationsAsync();
        const stillActive = all.some((n) => n.identifier === id);
        if (stillActive) {
          setReminderEnabled(true);
          // Try to read interval from stored trigger
          const match = all.find((n) => n.identifier === id);
          if (match?.trigger && "seconds" in match.trigger) {
            const mins = Math.round((match.trigger as any).seconds / 60);
            if (REMINDER_OPTIONS.includes(mins)) setReminderInterval(mins);
          }
          // Restore scheduled-at timestamp for countdown bar
          const scheduledAt = await AsyncStorage.getItem(REMINDER_SCHEDULED_AT_KEY);
          if (scheduledAt) setReminderScheduledAt(Number(scheduledAt));
        } else {
          await AsyncStorage.removeItem(REMINDER_STORAGE_KEY);
          await AsyncStorage.removeItem(REMINDER_SCHEDULED_AT_KEY);
        }
      } catch {}
    })();
  }, []);

  /* ── timer loop ── */
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, durationSeconds]);

  /* ── persist timer state ── */
  useEffect(() => {
    AsyncStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({ durationSeconds, remainingSeconds, isRunning, lastUpdatedAt: Date.now() })
    ).catch(() => {});
  }, [durationSeconds, remainingSeconds, isRunning]);

  /* ── reminder countdown tick ── */
  useEffect(() => {
    if (!reminderEnabled || !reminderScheduledAt) {
      setReminderCountdown(null);
      return;
    }
    const totalMs = reminderInterval * 60 * 1000;
    const tick = () => {
      const elapsed = Date.now() - reminderScheduledAt;
      const remaining = Math.max(0, Math.ceil((totalMs - (elapsed % totalMs)) / 1000));
      setReminderCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [reminderEnabled, reminderScheduledAt, reminderInterval]);

  /* ── derived ── */
  const totalSeconds = durationSeconds;
  const progress = remainingSeconds / totalSeconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  /* ── handlers ── */
  const handleToggleReminder = useCallback(async (value: boolean) => {
    setReminderEnabled(value);
    if (value) {
      await scheduleReminder(reminderInterval);
      const now = Date.now();
      setReminderScheduledAt(now);
      await AsyncStorage.setItem(REMINDER_SCHEDULED_AT_KEY, String(now));
    } else {
      await cancelReminder();
      await AsyncStorage.removeItem(REMINDER_SCHEDULED_AT_KEY);
      setReminderScheduledAt(null);
      setReminderCountdown(null);
    }
  }, [reminderInterval]);

  const handleReminderIntervalChange = useCallback(async (mins: number) => {
    setReminderInterval(mins);
    if (reminderEnabled) {
      await scheduleReminder(mins);
      const now = Date.now();
      setReminderScheduledAt(now);
      await AsyncStorage.setItem(REMINDER_SCHEDULED_AT_KEY, String(now));
    }
  }, [reminderEnabled]);

  /* ── render ── */
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: Spacing.lg }]}>

        {/* ══ Timer card ══ */}
        <View style={[styles.timerCard, { backgroundColor: theme.backgroundDefault }]}>
          {/* Left: ring */}
          <View style={styles.ringContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                stroke={theme.border ?? "rgba(0,0,0,0.08)"}
                fill="none"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
              />
              <Circle
                stroke={ACCENT}
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
              <ThemedText style={styles.timeText}>{formattedTime}</ThemedText>
            </View>
          </View>

          {/* Right: controls */}
          <View style={styles.timerControls}>
            <ThemedText style={[styles.timerLabel, { color: theme.textSecondary }]}>
              Hold Timer
            </ThemedText>
            <View style={styles.intervalRow}>
              {TIMER_OPTIONS.map((secs) => (
                <Pressable
                  key={secs}
                  onPress={() => {
                    setIsRunning(false);
                    setDurationSeconds(secs);
                    setRemainingSeconds(secs);
                  }}
                  style={[
                    styles.intervalChip,
                    { backgroundColor: theme.border ?? "rgba(0,0,0,0.07)" },
                    secs === durationSeconds && { backgroundColor: ACCENT },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.intervalChipText,
                      { color: secs === durationSeconds ? "#fff" : theme.text },
                    ]}
                  >
                    {secs < 60 ? `${secs}s` : `${secs / 60}m`}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setIsRunning((p) => !p)}
                style={[styles.primaryBtn, { backgroundColor: ACCENT }]}
              >
                <Feather name={isRunning ? "pause" : "play"} size={16} color="#fff" />
                <ThemedText style={styles.primaryBtnText}>
                  {isRunning ? "Pause" : "Start"}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => { setIsRunning(false); setRemainingSeconds(durationSeconds); }}
                style={[styles.secondaryBtn, { backgroundColor: theme.border ?? "rgba(0,0,0,0.07)" }]}
              >
                <Feather name="rotate-ccw" size={15} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ══ Reminder card ══ */}
        <View style={[styles.reminderCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderHeaderLeft}>
              <View style={[styles.reminderIconCircle, { backgroundColor: reminderEnabled ? "rgba(0,122,255,0.12)" : (theme.border ?? "rgba(0,0,0,0.07)") }]}>
                <Feather name="bell" size={18} color={reminderEnabled ? ACCENT : theme.textSecondary} />
              </View>
              <View>
                <ThemedText style={styles.reminderTitle}>Reminders</ThemedText>
                <ThemedText style={[styles.reminderSubtitle, { color: theme.textSecondary }]}>
                  {reminderEnabled
                    ? `Notifying every ${reminderInterval} min`
                    : "Get notified to do a pressure relief"}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: theme.border ?? "#ccc", true: ACCENT }}
              thumbColor="#fff"
            />
          </View>

          {reminderEnabled && (
            <>
              <View style={styles.reminderIntervalRow}>
                {REMINDER_OPTIONS.map((mins) => (
                  <Pressable
                    key={mins}
                    onPress={() => handleReminderIntervalChange(mins)}
                    style={[
                      styles.reminderChip,
                      { borderColor: theme.border ?? "#E0E0E0" },
                      mins === reminderInterval && { backgroundColor: ACCENT, borderColor: ACCENT },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.reminderChipText,
                        { color: mins === reminderInterval ? "#fff" : theme.text },
                      ]}
                    >
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {reminderCountdown !== null && (
                <View style={styles.countdownContainer}>
                  <View style={styles.countdownLabelRow}>
                    <ThemedText style={[styles.countdownLabel, { color: theme.textSecondary }]}>
                      Next reminder in
                    </ThemedText>
                    <ThemedText style={[styles.countdownTime, { color: ACCENT }]}>
                      {`${Math.floor(reminderCountdown / 60)}:${String(reminderCountdown % 60).padStart(2, "0")}`}
                    </ThemedText>
                  </View>
                  <View style={[styles.countdownTrack, { backgroundColor: theme.border ?? "rgba(0,0,0,0.08)" }]}>
                    <View
                      style={[
                        styles.countdownFill,
                        {
                          backgroundColor: ACCENT,
                          width: `${(reminderCountdown / (reminderInterval * 60)) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* ══ Guide section ══ */}
        <View style={styles.guideSection}>
          <ThemedText style={styles.guideHeading}>Pressure Relief Guide</ThemedText>

          <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              People with spinal cord injuries often cannot feel prolonged pressure on their
              skin. Sitting too long in one position reduces blood flow and can cause pressure
              injuries. Regular pressure reliefs allow blood to return to the skin and help
              prevent pressure sores.
            </ThemedText>
          </View>

          <View style={[styles.scheduleCard, { backgroundColor: "rgba(0,122,255,0.08)", borderColor: ACCENT }]}>
            <ThemedText style={[styles.scheduleTitle, { color: ACCENT }]}>
              Recommended Schedule
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              Every{" "}
              <ThemedText style={styles.bold}>20–30 minutes</ThemedText>
              {" "}— hold each position for{" "}
              <ThemedText style={styles.bold}>30–90 seconds</ThemedText>.
            </ThemedText>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.sourcesHeading, { color: theme.textSecondary }]}>SOURCES</ThemedText>
            {[
              { label: "Model Systems Knowledge Translation Center — Pressure Ulcers", url: "https://msktc.org/sci/factsheets/pressure-ulcers" },
              { label: "Paralyzed Veterans of America — Pressure Ulcer Prevention & Treatment", url: "https://www.pva.org/research-resources/publications/clinical-practice-guidelines" },
            ].map(({ label, url }) => (
              <Pressable key={url} onPress={() => Linking.openURL(url)}>
                <ThemedText style={styles.sourceLink}>{label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {TECHNIQUES.map((technique) => (
            <View
              key={technique.key}
              style={[styles.techniqueCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <ThemedText style={styles.techniqueTitle}>{technique.title}</ThemedText>

              <View style={[
                styles.imageRow,
                technique.images.length > 1 && styles.imageRowMulti,
              ]}>
                {technique.images.map((src, i) => (
                  <Image
                    key={i}
                    source={src}
                    style={[
                      styles.techniqueImage,
                      technique.images.length > 1 && styles.techniqueImageHalf,
                    ]}
                    resizeMode="contain"
                    accessibilityLabel={`${technique.title} illustration`}
                  />
                ))}
              </View>

              <ThemedText style={[styles.techniqueDesc, { color: theme.textSecondary }]}>
                {technique.description}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ─── styles ─── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingVertical: Spacing.lg, gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  /* timer card */
  timerCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: RING_SIZE,
    height: RING_SIZE,
  },
  timeOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  timerControls: {
    flex: 1,
    gap: Spacing.sm,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  intervalRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  intervalChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.small,
    alignItems: "center",
  },
  intervalChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    flex: 1,
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  /* reminder card */
  reminderCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  reminderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  reminderSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  reminderIntervalRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  reminderChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    borderWidth: 1,
  },
  reminderChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  countdownContainer: {
    gap: Spacing.xs,
  },
  countdownLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  countdownTime: {
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  countdownTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  countdownFill: {
    height: 5,
    borderRadius: 3,
  },

  /* guide */
  guideSection: {
    gap: Spacing.md,
  },
  guideHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  infoCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 23,
  },
  scheduleCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bold: { fontWeight: "700" },
  sourcesHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sourceLink: {
    fontSize: 13,
    color: "#007AFF",
    textDecorationLine: "underline",
    lineHeight: 22,
  },
  techniqueCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  techniqueTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  imageRow: { flexDirection: "row" },
  imageRowMulti: { gap: Spacing.sm },
  techniqueImage: {
    flex: 1,
    height: 200,
    borderRadius: BorderRadius.medium,
  },
  techniqueImageHalf: { height: 180 },
  techniqueDesc: {
    fontSize: 15,
    lineHeight: 23,
  },
});
