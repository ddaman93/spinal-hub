import { Feather } from "@expo/vector-icons";
import { MainStackParamList } from "@/types/navigation";

/* ───────────────────────── types ───────────────────────── */

export type ToolConfig = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  route?: keyof MainStackParamList;
  comingSoon?: boolean;
};

export type CategoryConfig = {
  id: string;
  title: string;
  icon: "sun" | "activity" | "users" | "calendar" | "heart";
  tools: ToolConfig[];
  route?: keyof MainStackParamList; // Optional direct route (bypasses CategoryDetail)
};

/* ───────────────────────── categories ───────────────────────── */

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "daily-routine",
    title: "Daily Routine",
    icon: "sun",
    tools: [
      {
        id: "morning",
        name: "Morning Routine",
        description: "Track your morning care tasks",
        icon: "sunrise",
        route: "MorningRoutine",
      },
      {
        id: "evening",
        name: "Evening Routine",
        description: "Complete your evening checklist",
        icon: "moon",
        route: "EveningRoutine",
      },
      {
        id: "hydration",
        name: "Hydration Tracker",
        description: "Log water intake throughout the day",
        icon: "droplet",
        route: "HydrationTracker",
      },
    ],
  },

  {
    id: "health-tracking",
    title: "Health Tracking",
    icon: "activity",
    tools: [
      {
        id: "vitals",
        name: "Vital Signs Log",
        description:
          "Record blood pressure, heart rate, and more",
        icon: "heart",
        route: "VitalsLog",
      },
      {
        id: "pressure-relief",
        name: "Pressure Relief Timer",
        description:
          "Timed reminders to shift weight and reduce pressure",
        icon: "clock",
        route: "PressureReliefTimer",
      },
      {
        id: "pain",
        name: "Pain Journal",
        description:
          "Track pain levels and locations",
        icon: "activity",
        route: "PainJournal",
      },
      {
        id: "medications",
        name: "Medications",
        description:
          "Manage and track your medications",
        icon: "clipboard",
        route: "MedicationTracker",
      },
    ],
  },

  {
    id: "care-support",
    title: "Care & Support",
    icon: "users",
    tools: [
      {
        id: "emergency",
        name: "Emergency Contacts",
        description:
          "Quick access to important contacts",
        icon: "phone",
        route: "EmergencyContacts",
      },
      {
        id: "caregiver-notes",
        name: "Caregiver Notes",
        description:
          "Share notes with your care team",
        icon: "file-text",
        comingSoon: true,
      },
    ],
  },

  {
    id: "appointments",
    title: "Appointments",
    icon: "calendar",
    tools: [
      {
        id: "schedule",
        name: "Schedule",
        description:
          "Manage upcoming appointments",
        icon: "calendar",
        route: "AppointmentScheduler",
      },
    ],
  },

  {
    id: "nz-spinal-trust",
    title: "NZ Spinal Trust",
    icon: "heart",
    route: "NZSpinalTrust",
    tools: [],
  },
];