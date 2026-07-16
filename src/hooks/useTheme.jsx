import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "jianglin-portfolio-theme";

function systemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function storedTheme() {
  if (typeof window === "undefined") return "system";
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(storedTheme);
  const [system, setSystem] = useState(systemTheme);
  const resolvedTheme = mode === "system" ? system : mode;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setSystem(media.matches ? "light" : "dark");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const cycleTheme = () => {
    const next = mode === "system" ? "dark" : mode === "dark" ? "light" : "system";
    const commit = () => {
      setMode(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Theme switching remains available even when storage is blocked.
      }
    };
    if (document.startViewTransition) document.startViewTransition(commit);
    else commit();
  };

  const value = useMemo(() => ({ cycleTheme, mode, resolvedTheme }), [mode, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
