import { useCallback, useEffect, useRef, useState } from "react";

export const ENTRY_SESSION_KEY = "portfolio-entered";

function hasWindow() {
  return typeof window !== "undefined";
}

function readEntrySession() {
  if (!hasWindow()) return false;
  try {
    return window.sessionStorage.getItem(ENTRY_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function markPortfolioEntered() {
  if (!hasWindow()) return;
  try {
    window.sessionStorage.setItem(ENTRY_SESSION_KEY, "true");
  } catch {
    // Storage can be unavailable in privacy-restricted contexts. Entry still works.
  }
  document.documentElement.dataset.portfolioEntered = "true";
}

export function useEntryState({ skip = false } = {}) {
  const [phase, setPhase] = useState("checking");
  const phaseRef = useRef("checking");
  const transitionTimerRef = useRef(0);

  useEffect(() => {
    const nextPhase = skip || readEntrySession() ? "entered" : "ready";
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
    if (nextPhase === "entered") markPortfolioEntered();
  }, [skip]);

  useEffect(() => () => window.clearTimeout(transitionTimerRef.current), []);

  const enter = useCallback(() => {
    if (phaseRef.current !== "ready") return;

    phaseRef.current = "exiting";
    markPortfolioEntered();
    setPhase("exiting");

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    transitionTimerRef.current = window.setTimeout(() => {
      phaseRef.current = "entered";
      setPhase("entered");
    }, reducedMotion ? 260 : 840);
  }, []);

  return {
    enter,
    phase,
    shouldRender: phase !== "entered",
  };
}
