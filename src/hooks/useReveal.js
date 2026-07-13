import { useEffect } from "react";

export function useReveal(dependency = "") {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = [...document.querySelectorAll(".reveal-item")];
    if (reduceMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
      },
      { threshold: 0.14, rootMargin: "0px 0px -6%" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [dependency]);
}

