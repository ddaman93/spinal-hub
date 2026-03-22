import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment } from "@/lib/storage";

const APPT_NOTIF_IDS_KEY = "appointment_notification_ids";
const APPT_CALENDAR_IDS_KEY = "appointment_calendar_event_ids";

type IdMap = Record<string, string>; // appointmentId -> notificationId or calendarEventId

async function getMap(key: string): Promise<IdMap> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveMap(key: string, map: IdMap): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(map));
}

/* ─── time parsing ─── */

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

/** Build a Date from "YYYY-MM-DD" + "9:00 AM" */
function buildDate(dateStr: string, timeStr: string): Date | null {
  const [year, month, day] = dateStr.split("-").map(Number);
  const parsed = parseTimeString(timeStr);
  if (!parsed) return null;
  return new Date(year, month - 1, day, parsed.hour, parsed.minute, 0);
}

/* ─── notifications ─── */

export async function scheduleAppointmentNotification(
  appointment: Appointment
): Promise<void> {
  if (Platform.OS === "web") return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") return;
  }

  const apptDate = buildDate(appointment.date, appointment.time);
  if (!apptDate) return;

  // Schedule 1 hour before
  const notifyAt = new Date(apptDate.getTime() - 60 * 60 * 1000);
  if (notifyAt <= new Date()) return; // already past

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Appointment",
      body: `${appointment.title} in 1 hour${appointment.location ? ` — ${appointment.location}` : ""}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyAt,
    },
  });

  const map = await getMap(APPT_NOTIF_IDS_KEY);
  map[appointment.id] = id;
  await saveMap(APPT_NOTIF_IDS_KEY, map);
}

export async function cancelAppointmentNotification(appointmentId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const map = await getMap(APPT_NOTIF_IDS_KEY);
  const id = map[appointmentId];
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    delete map[appointmentId];
    await saveMap(APPT_NOTIF_IDS_KEY, map);
  }
}

/* ─── calendar ─── */

async function getOrCreateSpinalHubCalendar(): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === "Spinal Hub");
  if (existing) return existing.id;

  // Create a new calendar
  if (Platform.OS === "ios") {
    const defaultSource = calendars.find((c) => c.source?.name === "iCloud")?.source
      ?? calendars.find((c) => c.source?.type === Calendar.SourceType.LOCAL)?.source;

    return await Calendar.createCalendarAsync({
      title: "Spinal Hub",
      color: "#007AFF",
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultSource?.id,
      source: defaultSource ?? { isLocalAccount: true, name: "Spinal Hub", type: Calendar.SourceType.LOCAL },
      name: "spinalHub",
      ownerAccount: "personal",
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
  } else {
    return await Calendar.createCalendarAsync({
      title: "Spinal Hub",
      color: "#007AFF",
      entityType: Calendar.EntityTypes.EVENT,
      source: { isLocalAccount: true, name: "Spinal Hub", type: Calendar.SourceType.LOCAL },
      name: "spinalHub",
      ownerAccount: "personal",
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
  }
}

export async function addAppointmentToCalendar(
  appointment: Appointment
): Promise<void> {
  if (Platform.OS === "web") return;

  const calendarId = await getOrCreateSpinalHubCalendar();
  if (!calendarId) return;

  const startDate = buildDate(appointment.date, appointment.time);
  if (!startDate) return;

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // default 1h duration

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: appointment.title,
    startDate,
    endDate,
    location: appointment.location,
    notes: appointment.notes,
    alarms: [{ relativeOffset: -60 }], // 1 hour before
  });

  const map = await getMap(APPT_CALENDAR_IDS_KEY);
  map[appointment.id] = eventId;
  await saveMap(APPT_CALENDAR_IDS_KEY, map);
}

export async function removeAppointmentFromCalendar(appointmentId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const map = await getMap(APPT_CALENDAR_IDS_KEY);
  const eventId = map[appointmentId];
  if (eventId) {
    await Calendar.deleteEventAsync(eventId).catch(() => {});
    delete map[appointmentId];
    await saveMap(APPT_CALENDAR_IDS_KEY, map);
  }
}
