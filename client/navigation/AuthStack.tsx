import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "@/screens/LoginScreen";
import SignUpScreen from "@/screens/SignUpScreen";

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

// Module-level callback so LoginScreen/SignUpScreen can trigger app transition
// without needing context or threaded props — same pattern as OnboardingStack.
let _onLogin: () => void = () => {};
export function triggerLogin() {
  _onLogin();
}

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack({ onLogin }: { onLogin: () => void }) {
  _onLogin = onLogin;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
