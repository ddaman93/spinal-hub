import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_IDS_KEY = "medication_notification_ids";

type NotifMap = Record<string, string[]>; // medicationId -> scheduledNotificationIds

async function getNotifMap(): Promise<NotifMap> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_IDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveNotifMap(map: NotifMap): Promise<void> {
  await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(map));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Parses "8:00 AM", "8:00 PM", "14:00" → { hour, minute } */
function parseTimeString(timeStr: string): { hour: number; minute: number } | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

function subtractMinutes(
  hour: number,
  minute: number,
  mins: number
): { hour: number; minute: number } {
  let m = minute - mins;
  let h = hour;
  if (m < 0) {
    m += 60;
    h = (h - 1 + 24) % 24;
  }
  return { hour: h, minute: m };
}

/**
 * Schedule a daily notification 5 minutes before each dose time for a medication.
 * Cancels any previous notifications for the same medicationId first.
 */
export async function scheduleMedicationNotifications(
  medicationId: string,
  medicationName: string,
  times: string[]
): Promise<void> {
  if (Platform.OS === "web") return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Cancel any existing notifications for this med first
  await cancelMedicationNotifications(medicationId);

  const ids: string[] = [];

  for (const timeStr of times) {
    const parsed = parseTimeString(timeStr);
    if (!parsed) continue;

    const { hour, minute } = subtractMinutes(parsed.hour, parsed.minute, 5);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Medication Reminder",
        body: `Take ${medicationName} in 5 minutes (${timeStr})`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    ids.push(id);
  }

  const map = await getNotifMap();
  map[medicationId] = ids;
  await saveNotifMap(map);
}

/** Cancel all scheduled notifications for a medication. */
export async function cancelMedicationNotifications(medicationId: string): Promise<void> {
  if (Platform.OS === "web") return;

  const map = await getNotifMap();
  const ids = map[medicationId] || [];
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
  );
  delete map[medicationId];
  await saveNotifMap(map);
}
