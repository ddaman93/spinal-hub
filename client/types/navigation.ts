export type MainStackParamList = {
  Dashboard: undefined;

  CategoryDetail: {
    category: string;
    title: string;
  };
  MobilityAssistiveTech: undefined;
    ManualWheelchairTech: undefined;
    PowerWheelchairTech: undefined;


  ClinicalTrialsList: {
    trials: {
      id: string;
      title: string;
      status: string;
      phase?: string;
      summary?: string;
      country?: string;
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
      image: string;
    };
  };

  Settings: undefined;
  VitalsLog: undefined;
  PainJournal: undefined;
  MedicationTracker: undefined;
  MorningRoutine: undefined;
  EveningRoutine: undefined;
  HydrationTracker: undefined;
  AppointmentScheduler: undefined;
  EmergencyContacts: undefined;
  PressureReliefTimer: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
