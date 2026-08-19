"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { DEFAULT_THEME_ID, getTheme, ThemeId } from "@/lib/themes";

const STORAGE_KEY = "polyglot-theme";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  setThemeId: () => {},
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);

  // Read from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (stored && getTheme(stored)) setThemeIdState(stored);
    } catch {
      // SSR / private browsing — ignore
    }
  }, []);

  // Apply CSS vars to <html> whenever theme changes
  useEffect(() => {
    const def = getTheme(themeId);
    const root = document.documentElement;
    Object.entries(def.cssVars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [themeId]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
