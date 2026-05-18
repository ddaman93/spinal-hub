export type MainStackParamList = {
  Dashboard: undefined;

  Tools: undefined;

  SciNewsList: undefined;

  CategoryDetail: {
    category: string;
    title: string;
  };

  AllWheelchairs: undefined;
  ManualWheelchairTech: undefined;
  PowerWheelchairTech: undefined;
  ComputerProductivityTech: undefined;
  AllAssistiveTech: {
    categoryId?: string;
  };

  ClinicalTrialsList: {
    trials?: {
      id: string;
      title: string;
      status: string;
      phase?: string;
      summary?: string;
      countries?: string[];
      source?: "clinicaltrials.gov" | "anzctr";
      url?: string;
      eligibilityText?: string;
    }[];
  };

  ClinicalTrialDetail: {
    trialId: string;
  };

  AssistiveTechList: undefined;

  AssistiveTechDetail: {
    itemId: string;
  };

  ProductDetail: {
    product: {
      id: string;
      title: string;
      description: string;
      image: any;
      whatItIs?: string;
      whatItDoes?: string;
      whoItsFor?: string;
      productUrl?: string;
      videoUrl?: string;
    };
  };

  Settings: undefined;
  DisplaySettings: undefined;
  Feedback: undefined;
  FeatureTour: undefined;
  VitalsLog: { patientId: string; patientName: string };
  PainJournal: { patientId: string; patientName: string };
  MedicationTracker: { patientId: string; patientName: string };
  MorningRoutine: { patientId: string; patientName: string };
  EveningRoutine: { patientId: string; patientName: string };
  HydrationTracker: { patientId: string; patientName: string };
  AppointmentScheduler: { patientId: string; patientName: string };
  EmergencyContacts: undefined;
  PressureReliefTimer: undefined;
  NZSpinalTrust: undefined;
  BladderLog: { patientId: string; patientName: string };
  BowelLog: { patientId: string; patientName: string };
  SkinCheckLog: { patientId: string; patientName: string };
  CarePreferences: { patientId: string; patientName: string };

  PressureInjuryTracker: undefined;
  PressureInjuryDetail: {
    injuryId: string;
    site: string;
    siteLabel?: string;
  };
  AddPressureCheck: {
    injuryId: string;
    site: string;
  };
  CareHub: undefined;
  PatientDetail: {
    patientId: string;
    patientName: string;
    role: string;
  };
  HandoverNotes: {
    patientId: string;
    patientName: string;
  };

  AutonomicDysreflexia: undefined;
  SCIMedications: undefined;
  SCIMedicationDetail: {
    medicationId: string;
    name: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
