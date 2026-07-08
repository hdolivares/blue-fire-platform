"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "./gsap";

/** Cyan dot + trailing ring. Accent only — the native cursor stays on.
 *  Hidden entirely for coarse pointers / reduced motion (CSS + JS guard). */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches)
      return;

    gsap.set([dot, ring], { opacity: 0 });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let visible = false;
    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const hot = (e.target as Element | null)?.closest?.(
        "a, button, [data-cursor]"
      );
      ring.classList.toggle("is-active", !!hot);
    };
    const out = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.documentElement.addEventListener("mouseleave", out);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", out);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="bf-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="bf-cursor-ring" aria-hidden="true" />
    </>
  );
}
