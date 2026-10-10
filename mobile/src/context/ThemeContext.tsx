import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  border: string;
  borderLight: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
  danger: string;
  success: string;
  placeholder: string;
  onAccent: string;
}

export const lightColors: ThemeColors = {
  background: "#ffffff",
  card: "#ffffff",
  surface: "#f4f4f5",
  border: "#d4d4d8",
  borderLight: "#e4e4e7",
  text: "#18181b",
  textMuted: "#52525b",
  textSubtle: "#71717a",
  textFaint: "#a1a1aa",
  accent: "#4f46e5",
  accentSoft: "#eef2ff",
  accentBorder: "#c7d2fe",
  accentText: "#3730a3",
  danger: "#dc2626",
  success: "#15803d",
  placeholder: "#71717a",
  onAccent: "#ffffff",
};

export const darkColors: ThemeColors = {
  background: "#09090b",
  card: "#18181b",
  surface: "#27272a",
  border: "#3f3f46",
  borderLight: "#27272a",
  text: "#f4f4f5",
  textMuted: "#d4d4d8",
  textSubtle: "#a1a1aa",
  textFaint: "#71717a",
  accent: "#6366f1",
  accentSoft: "#1e1b4b",
  accentBorder: "#3730a3",
  accentText: "#c7d2fe",
  danger: "#f87171",
  success: "#4ade80",
  placeholder: "#71717a",
  onAccent: "#ffffff",
};

interface ThemeContextValue {
  dark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("theme");
      if (stored === "light" || stored === "dark") setMode(stored);
    })();
  }, []);

  const dark = mode === "dark" || (mode === null && system === "dark");
  const colors = dark ? darkColors : lightColors;

  function toggleTheme() {
    setMode((current) => {
      const next =
        (current ?? system) === "dark" ? "light" : "dark";
      void AsyncStorage.setItem("theme", next);
      return next;
    });
  }

  const value = useMemo<ThemeContextValue>(
    () => ({ dark, colors, toggleTheme }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
