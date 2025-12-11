export type MainStackParamList = {
  Dashboard: undefined;
  CategoryDetail: {
    category: string;
    title: string;
  };
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
