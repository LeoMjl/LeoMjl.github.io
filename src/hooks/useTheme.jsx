import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "jianglin-portfolio-theme";

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
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
      localStorage.setItem(STORAGE_KEY, next);
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

