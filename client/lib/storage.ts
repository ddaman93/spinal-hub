import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  HEALTH_VITALS: "health_vitals",
  PAIN_ENTRIES: "pain_entries",
  MEDICATIONS: "medications",
  MEDICATION_LOGS: "medication_logs",
  HYDRATION_LOGS: "hydration_logs",
  ROUTINE_TASKS: "routine_tasks",
  ROUTINE_COMPLETIONS: "routine_completions",
  APPOINTMENTS: "appointments",
  USER_PREFERENCES: "user_preferences",
  EMERGENCY_CONTACTS: "emergency_contacts",
} as const;

export type VitalEntry = {
  id: string;
  type: "blood_pressure" | "heart_rate" | "temperature" | "weight" | "oxygen";
  value: string;
  systolic?: number;
  diastolic?: number;
  timestamp: string;
  notes?: string;
};

export type PainEntry = {
  id: string;
  level: number;
  location: string;
  description?: string;
  timestamp: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
};

export type MedicationLog = {
  id: string;
  medicationId: string;
  taken: boolean;
  scheduledTime: string;
  actualTime?: string;
  date: string;
};

export type HydrationLog = {
  id: string;
  amount: number;
  unit: "oz" | "ml";
  timestamp: string;
  date: string;
};

export type RoutineTask = {
  id: string;
  name: string;
  category: "morning" | "evening" | "anytime";
  order: number;
};

export type RoutineCompletion = {
  id: string;
  taskId: string;
  date: string;
  completedAt: string;
};

export type Appointment = {
  id: string;
  title: string;
  type: "doctor" | "therapy" | "equipment" | "other";
  date: string;
  time: string;
  location?: string;
  notes?: string;
  reminder?: boolean;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
};

export type UserPreferences = {
  darkMode?: boolean;
  dailyWaterGoal: number;
  waterUnit: "oz" | "ml";
};

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

export const storage = {
  vitals: {
    getAll: () => getItem<VitalEntry[]>(STORAGE_KEYS.HEALTH_VITALS),
    save: (entries: VitalEntry[]) => setItem(STORAGE_KEYS.HEALTH_VITALS, entries),
    add: async (entry: VitalEntry) => {
      const entries = (await storage.vitals.getAll()) || [];
      entries.unshift(entry);
      await storage.vitals.save(entries);
    },
    delete: async (id: string) => {
      const entries = (await storage.vitals.getAll()) || [];
      await storage.vitals.save(entries.filter((e) => e.id !== id));
    },
  },

  pain: {
    getAll: () => getItem<PainEntry[]>(STORAGE_KEYS.PAIN_ENTRIES),
    save: (entries: PainEntry[]) => setItem(STORAGE_KEYS.PAIN_ENTRIES, entries),
    add: async (entry: PainEntry) => {
      const entries = (await storage.pain.getAll()) || [];
      entries.unshift(entry);
      await storage.pain.save(entries);
    },
    delete: async (id: string) => {
      const entries = (await storage.pain.getAll()) || [];
      await storage.pain.save(entries.filter((e) => e.id !== id));
    },
  },

  medications: {
    getAll: () => getItem<Medication[]>(STORAGE_KEYS.MEDICATIONS),
    save: (meds: Medication[]) => setItem(STORAGE_KEYS.MEDICATIONS, meds),
    add: async (med: Medication) => {
      const meds = (await storage.medications.getAll()) || [];
      meds.push(med);
      await storage.medications.save(meds);
    },
    update: async (med: Medication) => {
      const meds = (await storage.medications.getAll()) || [];
      const index = meds.findIndex((m) => m.id === med.id);
      if (index !== -1) {
        meds[index] = med;
        await storage.medications.save(meds);
      }
    },
    delete: async (id: string) => {
      const meds = (await storage.medications.getAll()) || [];
      await storage.medications.save(meds.filter((m) => m.id !== id));
    },
  },

  medicationLogs: {
    getAll: () => getItem<MedicationLog[]>(STORAGE_KEYS.MEDICATION_LOGS),
    save: (logs: MedicationLog[]) => setItem(STORAGE_KEYS.MEDICATION_LOGS, logs),
    getByDate: async (date: string) => {
      const logs = (await storage.medicationLogs.getAll()) || [];
      return logs.filter((l) => l.date === date);
    },
    log: async (log: MedicationLog) => {
      const logs = (await storage.medicationLogs.getAll()) || [];
      const existingIndex = logs.findIndex(
        (l) => l.medicationId === log.medicationId && l.date === log.date && l.scheduledTime === log.scheduledTime
      );
      if (existingIndex !== -1) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }
      await storage.medicationLogs.save(logs);
    },
  },

  hydration: {
    getAll: () => getItem<HydrationLog[]>(STORAGE_KEYS.HYDRATION_LOGS),
    save: (logs: HydrationLog[]) => setItem(STORAGE_KEYS.HYDRATION_LOGS, logs),
    getByDate: async (date: string) => {
      const logs = (await storage.hydration.getAll()) || [];
      return logs.filter((l) => l.date === date);
    },
    add: async (log: HydrationLog) => {
      const logs = (await storage.hydration.getAll()) || [];
      logs.push(log);
      await storage.hydration.save(logs);
    },
    delete: async (id: string) => {
      const logs = (await storage.hydration.getAll()) || [];
      await storage.hydration.save(logs.filter((l) => l.id !== id));
    },
  },

  routineTasks: {
    getAll: () => getItem<RoutineTask[]>(STORAGE_KEYS.ROUTINE_TASKS),
    save: (tasks: RoutineTask[]) => setItem(STORAGE_KEYS.ROUTINE_TASKS, tasks),
    getDefaults: (): RoutineTask[] => [
      { id: "1", name: "Take morning medications", category: "morning", order: 1 },
      { id: "2", name: "Bowel program", category: "morning", order: 2 },
      { id: "3", name: "Skin check", category: "morning", order: 3 },
      { id: "4", name: "Range of motion exercises", category: "morning", order: 4 },
      { id: "5", name: "Evening medications", category: "evening", order: 1 },
      { id: "6", name: "Catheter care", category: "evening", order: 2 },
      { id: "7", name: "Positioning for sleep", category: "evening", order: 3 },
    ],
    initialize: async () => {
      const existing = await storage.routineTasks.getAll();
      if (!existing || existing.length === 0) {
        await storage.routineTasks.save(storage.routineTasks.getDefaults());
      }
    },
  },

  routineCompletions: {
    getAll: () => getItem<RoutineCompletion[]>(STORAGE_KEYS.ROUTINE_COMPLETIONS),
    save: (completions: RoutineCompletion[]) => setItem(STORAGE_KEYS.ROUTINE_COMPLETIONS, completions),
    getByDate: async (date: string) => {
      const completions = (await storage.routineCompletions.getAll()) || [];
      return completions.filter((c) => c.date === date);
    },
    toggle: async (taskId: string, date: string) => {
      const completions = (await storage.routineCompletions.getAll()) || [];
      const existingIndex = completions.findIndex((c) => c.taskId === taskId && c.date === date);
      if (existingIndex !== -1) {
        completions.splice(existingIndex, 1);
      } else {
        completions.push({
          id: Date.now().toString(),
          taskId,
          date,
          completedAt: new Date().toISOString(),
        });
      }
      await storage.routineCompletions.save(completions);
      return existingIndex === -1;
    },
  },

  appointments: {
    getAll: () => getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS),
    save: (appointments: Appointment[]) => setItem(STORAGE_KEYS.APPOINTMENTS, appointments),
    add: async (appointment: Appointment) => {
      const appointments = (await storage.appointments.getAll()) || [];
      appointments.push(appointment);
      appointments.sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime());
      await storage.appointments.save(appointments);
    },
    update: async (appointment: Appointment) => {
      const appointments = (await storage.appointments.getAll()) || [];
      const index = appointments.findIndex((a) => a.id === appointment.id);
      if (index !== -1) {
        appointments[index] = appointment;
        await storage.appointments.save(appointments);
      }
    },
    delete: async (id: string) => {
      const appointments = (await storage.appointments.getAll()) || [];
      await storage.appointments.save(appointments.filter((a) => a.id !== id));
    },
    getUpcoming: async () => {
      const appointments = (await storage.appointments.getAll()) || [];
      const now = new Date();
      return appointments.filter((a) => new Date(a.date + " " + a.time) >= now);
    },
  },

  emergencyContacts: {
    getAll: () => getItem<EmergencyContact[]>(STORAGE_KEYS.EMERGENCY_CONTACTS),
    save: (contacts: EmergencyContact[]) => setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts),
    add: async (contact: EmergencyContact) => {
      const contacts = (await storage.emergencyContacts.getAll()) || [];
      contacts.push(contact);
      await storage.emergencyContacts.save(contacts);
    },
    update: async (contact: EmergencyContact) => {
      const contacts = (await storage.emergencyContacts.getAll()) || [];
      const index = contacts.findIndex((c) => c.id === contact.id);
      if (index !== -1) {
        contacts[index] = contact;
        await storage.emergencyContacts.save(contacts);
      }
    },
    delete: async (id: string) => {
      const contacts = (await storage.emergencyContacts.getAll()) || [];
      await storage.emergencyContacts.save(contacts.filter((c) => c.id !== id));
    },
  },

  preferences: {
    get: async (): Promise<UserPreferences> => {
      const prefs = await getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
      return prefs || { dailyWaterGoal: 64, waterUnit: "oz" };
    },
    save: (prefs: UserPreferences) => setItem(STORAGE_KEYS.USER_PREFERENCES, prefs),
  },
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
