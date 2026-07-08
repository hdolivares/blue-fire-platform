"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "./gsap";
import { setLenis } from "./lenis-store";

/** Lenis smooth scrolling, driven by the GSAP ticker and synced with
 *  ScrollTrigger. No-ops under prefers-reduced-motion (native scroll). */
export default function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
