export type MainStackParamList = {
  Dashboard: undefined;
  CategoryDetail: {
    category: string;
    title: string;
  };
  AssistiveTechDetail: {
    itemId: string;
    };
  AssistiveTechList: undefined;
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
