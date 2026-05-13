import { MainStackParamList } from "@/types/navigation";

export type CareTile = {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  screen?: keyof MainStackParamList;
  // which carer roles see this tile in PatientDetailScreen
  // "patient" = always shown on patient's own dashboard
  roles: string[];
};

export const CARE_TILES: CareTile[] = [
  { id: "wounds",       icon: "shield",   label: "Pressure Injuries", sublabel: "Wounds, staging, checks", color: "#FF6B6B", screen: "PressureInjuryTracker", roles: ["patient", "carer", "clinician"] },
  { id: "vitals",       icon: "activity", label: "Vital Signs",       sublabel: "BP, HR, O₂, temp",        color: "#4A90D9", screen: "VitalsLog",             roles: ["patient", "carer", "clinician"] },
  { id: "bladder",      icon: "droplet",  label: "Bladder Log",       sublabel: "Output, catheter",        color: "#00BCD4", screen: "BladderLog",            roles: ["patient", "carer", "clinician"] },
  { id: "pain",         icon: "zap",      label: "Pain Journal",      sublabel: "Score, location",         color: "#FF7043", screen: "PainJournal",           roles: ["patient", "carer", "clinician"] },
  { id: "medications",  icon: "package",  label: "Medications",       sublabel: "Doses, times, PRN",       color: "#9C27B0", screen: "MedicationTracker",     roles: ["patient", "carer", "clinician"] },
  { id: "hydration",    icon: "droplet",  label: "Hydration",         sublabel: "Fluid intake",            color: "#29B6F6", screen: "HydrationTracker",      roles: ["patient", "carer", "clinician"] },
  { id: "skin",         icon: "eye",      label: "Skin Check",        sublabel: "Skin check log",          color: "#26A69A", screen: undefined,               roles: ["patient", "carer", "clinician"] },
  { id: "routine",      icon: "sun",      label: "Morning Routine",   sublabel: "ADLs, positioning",       color: "#FFC107", screen: "MorningRoutine",        roles: ["patient", "carer", "clinician", "family"] },
  { id: "evening",      icon: "moon",     label: "Evening Routine",   sublabel: "Skin, positioning",       color: "#5C6BC0", screen: "EveningRoutine",        roles: ["patient", "carer", "clinician", "family"] },
  { id: "appointments", icon: "calendar", label: "Appointments",      sublabel: "Upcoming, history",       color: "#FF9800", screen: "AppointmentScheduler",  roles: ["patient", "carer", "clinician", "family"] },
  { id: "care_prefs",   icon: "heart",    label: "Care Preferences",  sublabel: "Likes, dislikes, needs",  color: "#E91E63", screen: undefined,               roles: ["patient", "carer", "clinician", "family"] },
];
