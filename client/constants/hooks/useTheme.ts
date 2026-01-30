import { useThemeContext } from "@/context/ThemeContext";

export function useTheme() {
  const { theme, isDark, toggleTheme, colorScheme, isLoading } = useThemeContext();

  return {
    theme,
    isDark,
    toggleTheme,
    colorScheme,
    isLoading,
  };
}
