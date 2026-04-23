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
  description?: string;
  icon: keyof typeof Feather.glyphMap;
  tools: ToolConfig[];
  route?: keyof MainStackParamList; // Optional direct route (bypasses CategoryDetail)
};

/* ───────────────────────── categories ───────────────────────── */

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "daily-routine",
    title: "Daily Routine",
    description: "Morning & evening care",
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
    description: "Vitals, pain & pressure relief",
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
        id: "bladder",
        name: "Bladder Log",
        description: "Log catheterization and voiding events",
        icon: "droplet",
        route: "BladderLog",
      },
    ],
  },

  {
    id: "care-support",
    title: "Care & Support",
    description: "Contacts & carer notes",
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
      {
        id: "care-preferences",
        name: "Care Preferences",
        description: "Quick-reference profile for carers",
        icon: "user",
        route: "CarePreferences",
      },
    ],
  },

  {
    id: "skin-care",
    title: "Skin Care",
    description: "Pressure injuries & prevention",
    icon: "shield",
    route: "SkinCare",
    tools: [],
  },

  {
    id: "medications",
    title: "Medications",
    description: "Manage & track your meds",
    icon: "clipboard",
    route: "MedicationTracker",
    tools: [],
  },

  {
    id: "appointments",
    title: "Appointments",
    description: "Manage upcoming visits",
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
    description: "Peer support & resources",
    icon: "heart",
    route: "NZSpinalTrust",
    tools: [],
  },

  {
    id: "sci-medications",
    title: "SCI Medications",
    description: "Common SCI drug info",
    icon: "thermometer",
    route: "SCIMedications",
    tools: [],
  },

  {
    id: "ccs-disability-action",
    title: "CCS Disability Action",
    description: "Funding & advocacy help",
    icon: "shield",
    route: "CcsDisabilityAction",
    tools: [],
  },

  {
    id: "mobility-taxis",
    title: "Mobility Taxis",
    description: "Accessible taxi listings",
    icon: "navigation",
    route: "MobilityTaxiList",
    tools: [],
  },

  {
    id: "accessible-transport-map",
    title: "Transport Map",
    description: "Find accessible routes",
    icon: "map",
    route: "AccessibleTransportMap",
    tools: [],
  },

  {
    id: "carer-companies",
    title: "Carer Companies",
    description: "NZ carer providers",
    icon: "user-check",
    route: "CarerCompanyList",
    tools: [],
  },

  {
    id: "spinal-rehab-units",
    title: "Spinal Rehab Units",
    description: "NZ rehab centre contacts",
    icon: "activity",
    route: "SpinalRehabUnits",
    tools: [],
  },

  {
    id: "autonomic-dysreflexia",
    title: "AD Emergency",
    description: "Symptoms, triggers & response",
    icon: "alert-triangle",
    route: "AutonomicDysreflexia",
    tools: [],
  },

  {
    id: "mental-health",
    title: "Mental Health",
    description: "Crisis lines & support",
    icon: "heart",
    route: "MentalHealthResources",
    tools: [],
  },

  {
    id: "community-chat",
    title: "Community Chat",
    description: "Chat with the SCI community",
    icon: "message-circle",
    route: "CommunityChat",
    tools: [],
  },

  {
    id: "back-on-track",
    title: "Back on Track",
    description: "NZ Spinal Trust guide",
    icon: "book-open",
    route: "BackOnTrack",
    tools: [],
  },
];