import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "@/constants/theme";

const THEME_STORAGE_KEY = "user_theme_preference";

type ColorScheme = "light" | "dark";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  isDark: boolean;
  theme: typeof Colors.light;
  toggleTheme: () => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const systemColorScheme = useSystemColorScheme();
  const [userPreference, setUserPreference] = useState<ColorScheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    async function loadThemePreference(): Promise<void> {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
          setUserPreference(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadThemePreference();
  }, []);

  // Determine effective color scheme: user preference takes precedence over system
  const colorScheme: ColorScheme = useMemo(() => {
    if (userPreference !== null) {
      return userPreference;
    }
    return systemColorScheme === "dark" ? "dark" : "light";
  }, [userPreference, systemColorScheme]);

  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme];

  const toggleTheme = useCallback(async (): Promise<void> => {
    const newColorScheme: ColorScheme = colorScheme === "dark" ? "light" : "dark";
    setUserPreference(newColorScheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newColorScheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  }, [colorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      isDark,
      theme,
      toggleTheme,
      isLoading,
    }),
    [colorScheme, isDark, theme, toggleTheme, isLoading]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
