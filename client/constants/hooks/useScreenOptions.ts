import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { AnimatedHeaderBackground } from "@/components/AnimatedHeaderBackground";

import { useTheme } from "@/hooks/useTheme";

export function useScreenOptions(
  params: { transparent?: boolean } = {}
): NativeStackNavigationOptions {
  const { theme, isDark } = useTheme();
  const transparent = params.transparent !== false;

  return {
    headerTitleAlign: "center",
    headerTransparent: transparent,
    headerTintColor: isDark ? "#FFFFFF" : theme.text,
    // Stable module-level function reference — React Navigation keeps the
    // component mounted across renders instead of remounting it.
    headerBackground: transparent ? AnimatedHeaderBackground : undefined,
    headerStyle: transparent ? undefined : { backgroundColor: theme.backgroundRoot },
    gestureEnabled: true,
    gestureDirection: "horizontal",
    fullScreenGestureEnabled: true,
    contentStyle: {
      backgroundColor: theme.backgroundRoot,
    },
  };
}
