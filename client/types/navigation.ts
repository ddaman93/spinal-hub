export type MainStackParamList = {
  Dashboard: undefined;

  Tools: undefined;

  SciNewsList: undefined;

  CategoryDetail: {
    category: string;
    title: string;
  };

  ManualWheelchairTech: undefined;
  PowerWheelchairTech: undefined;
  AllAssistiveTech: {
    categoryId?: string;
  };

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
      image: any;
      whatItIs?: string;
      whatItDoes?: string;
      whoItsFor?: string;
      productUrl?: string;
    };
  };

  Settings: undefined;
  DisplaySettings: undefined;
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
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
