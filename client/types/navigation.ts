export type MainStackParamList = {
  Dashboard: undefined;
  CategoryDetail: {
    category: string;
    title: string;
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
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
