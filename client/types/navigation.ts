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
  VitalsLog: undefined;
  PainJournal: undefined;
  MedicationTracker: undefined;
  MorningRoutine: undefined;
  EveningRoutine: undefined;
  HydrationTracker: undefined;
  AppointmentScheduler: undefined;
  EmergencyContacts: undefined;
  PressureReliefTimer: undefined;
  NZSpinalTrust: undefined;
  BladderLog: undefined;

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
  CareNetwork: undefined;
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
