import Constants from "expo-constants";
import { Platform } from "react-native";

export function getApiBaseUrl() {
  // Web preview (browser)
  if (Platform.OS === "web") {
    return "";
  }

  // Replit public app domain (works in Expo Go)
  const appUrl =
    Constants.expoConfig?.extra?.replitAppUrl ||
    process.env.EXPO_PUBLIC_DOMAIN;

  if (!appUrl) {
    throw new Error("Replit app URL not found");
  }

  return appUrl.startsWith("http")
    ? appUrl
    : `https://${appUrl}`;
}