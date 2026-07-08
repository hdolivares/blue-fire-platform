"use client";

import type Lenis from "lenis";

// Tiny module-level store so nav links / menu can drive the same Lenis
// instance the SmoothScroll provider owns (or fall back to native scroll).
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}
