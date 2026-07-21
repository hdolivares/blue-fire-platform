"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "./gsap";
import { Reveal } from "./ux";

/* Sentence fragments with per-word scroll-scrub reveal. */
const SENTENCES: Array<Array<{ w: string; cls?: string }>> = [
  [
    { w: "The" },
    { w: "most" },
    { w: "advanced" },
    { w: "tech" },
    { w: "in" },
    { w: "the" },
    { w: "world," },
  ],
  [
    { w: "in" },
    { w: "one" },
    { w: "system" },
    { w: "—" },
  ],
  [
    { w: "so" },
    { w: "anyone" },
    { w: "can" },
    { w: "harvest" },
    { w: "the" },
    { w: "water,", cls: "accent" },
  ],
  [
    { w: "keep" },
    { w: "the" },
    { w: "energy" },
    { w: "savings,", cls: "ember" },
  ],
  [
    { w: "and" },
    { w: "share" },
    { w: "in" },
    { w: "the" },
    { w: "profits.", cls: "accent" },
  ],
];

const FIGURES = [
  { v: "3×", label: "utilities from one compressor cycle" },
  { v: "0", label: "liters drawn from wells or mains" },
  { v: "92%", label: "of the cycle's heat put back to work" },
];

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const words = el.querySelectorAll<HTMLElement>(".bf-manifesto-text .w");
      if (reducedMotion()) {
        gsap.set(words, { opacity: 1 });
        return;
      }
      gsap.to(words, {
        opacity: 1,
        ease: "none",
        stagger: 0.6,
        scrollTrigger: {
          trigger: el,
          start: "top 72%",
          end: "top 12%",
          scrub: 0.5,
        },
      });
    },
    { dependencies: [] }
  );

  return (
    <section ref={ref} className="bf-manifesto">
      <div className="bf-wrap">
        <p className="bf-manifesto-text">
          {SENTENCES.map((sentence, si) => (
            <span key={si} className="s">
              {sentence.map((token, wi) => (
                <span key={wi} className={`w ${token.cls ?? ""}`}>
                  {token.w}
                  {wi < sentence.length - 1 ? " " : ""}
                </span>
              ))}{" "}
            </span>
          ))}
        </p>

        <Reveal className="bf-manifesto-foot" targets=".bf-mfig" stagger={0.12}>
          {FIGURES.map((f) => (
            <div key={f.label} className="bf-mfig">
              <span
                className="bf-display"
                style={{ fontSize: "1.6rem", display: "block", marginBottom: "0.35rem" }}
              >
                {f.v}
              </span>
              <span className="bf-mono-xs">{f.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
