import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootTabsNavigator from "@/navigation/RootTabsNavigator";
import OnboardingStack from "@/navigation/OnboardingStack";
import AuthStack from "@/navigation/AuthStack";
import { ONBOARDING_COMPLETE_KEY } from "@/screens/onboarding/OnboardingCompleteScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";
import { useTheme } from "@/hooks/useTheme";
import { navigationRef } from "@/lib/navigationRef";
import { getToken, clearToken } from "@/lib/auth";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderScrollProvider } from "@/context/HeaderScrollContext";

// Show notifications while app is in foreground (native only)
if (Platform.OS !== "web") {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {}
}

// Separate component so the hook only runs on native (avoids web errors)
function NotificationResponseHandler() {
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const screen = lastResponse?.notification?.request?.content?.data?.screen as string | undefined;
    if (screen === "PressureReliefTimer" && navigationRef.isReady()) {
      navigationRef.navigate("PressureReliefTimer");
    }
  }, [lastResponse]);
  return null;
}

function AppContent(): React.JSX.Element {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const loggedIn = token !== null;
      const onboarded = loggedIn
        ? (await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)) === "true"
        : false;
      setIsLoggedIn(loggedIn);
      setOnboardingDone(onboarded);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function handleLogin() {
    setIsLoggedIn(true);
    setOnboardingDone(false);
  }

  async function handleSignOut() {
    await clearToken();
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    setIsLoggedIn(false);
    setOnboardingDone(false);
  }

  return (
    <AuthProvider value={{ signOut: handleSignOut }}>
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <NavigationContainer ref={navigationRef}>
          {!isLoggedIn ? (
            <AuthStack onLogin={handleLogin} />
          ) : onboardingDone ? (
            <RootTabsNavigator />
          ) : (
            <OnboardingStack onComplete={() => setOnboardingDone(true)} />
          )}
          {Platform.OS !== "web" && isLoggedIn && onboardingDone && <NotificationResponseHandler />}
        </NavigationContainer>
        <StatusBar style={isDark ? "light" : "dark"} />
      </KeyboardProvider>
    </GestureHandlerRootView>
    </AuthProvider>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <HeaderScrollProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </HeaderScrollProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
});
