"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "./gsap";
import { LogoMark } from "./assets";

/** Marks the document loaded and lets the hero start its entrance. */
function reveal() {
  document.documentElement.classList.add("bf-loaded");
  window.dispatchEvent(new Event("bf:loaded"));
}

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      if (reducedMotion()) {
        reveal();
        setDone(true);
        return;
      }

      let seen = false;
      try {
        seen = sessionStorage.getItem("bf-seen") === "1";
      } catch {
        /* storage unavailable — treat as first visit */
      }

      // Repeat visit in the same session: quick fade, no ceremony.
      if (seen) {
        reveal();
        gsap.to(root, {
          autoAlpha: 0,
          duration: 0.45,
          delay: 0.1,
          ease: "power2.out",
          onComplete: () => setDone(true),
        });
        return;
      }

      const count = root.querySelector<HTMLElement>(".bf-preloader-count");
      const bar = root.querySelector<HTMLElement>(".bf-preloader-bar");
      const mark = root.querySelector<HTMLElement>(".bf-preloader-mark");
      const tag = root.querySelector<HTMLElement>(".bf-preloader-tag");
      const obj = { v: 0 };

      gsap
        .timeline({
          onComplete: () => setDone(true),
        })
        .fromTo(
          [mark, tag],
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 }
        )
        .to(
          obj,
          {
            v: 100,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count)
                count.textContent = String(Math.round(obj.v)).padStart(3, "0");
            },
          },
          0
        )
        .to(bar, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 0)
        .add(() => {
          try {
            sessionStorage.setItem("bf-seen", "1");
          } catch {
            /* ignore */
          }
          reveal();
        }, "+=0.15")
        .to(root, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "+=0.05");
    },
    { dependencies: [] }
  );

  if (done) return null;

  return (
    <div ref={rootRef} className="bf-preloader" aria-hidden="true">
      <noscript>
        <style>{`.bf-preloader{display:none}`}</style>
      </noscript>
      <LogoMark className="bf-preloader-mark" gid="bfMarkPre" />
      <p className="bf-preloader-tag bf-mono-xs">
        Pure water, out of thin air
      </p>
      <div className="bf-preloader-count">000</div>
      <div className="bf-preloader-bar" />
    </div>
  );
}
