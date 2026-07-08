"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "./gsap";
import { Counter, Reveal, SectionHead } from "./ux";

const STATS = [
  { value: 72440, prefix: "$", unit: "/yr", label: "Net annual savings for the client, verified." },
  { value: 1600, prefix: "", unit: "L/day", label: "High-quality drinking water produced on site." },
  { value: 210, prefix: "", unit: "L/day", label: "LPG displaced by retiring the old boiler." },
];

export default function CaseStudy() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      gsap.fromTo(
        el.querySelector(".bf-case-media"),
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { dependencies: [] }
  );

  return (
    <section ref={ref} id="proof" className="bf-case">
      <div className="bf-case-media" aria-hidden="true">
        <Image
          src="/piscina-viva-villahermosa.webp"
          alt=""
          fill
          sizes="100vw"
          quality={72}
        />
      </div>
      <div className="bf-case-tint" aria-hidden="true" />

      <div className="bf-wrap bf-case-inner">
        <SectionHead
          index="05"
          label="Proof"
          title={
            <>
              Proof, poured{" "}
              <span className="bf-serif-it" style={{ color: "var(--bf-cyan)" }}>
                daily.
              </span>
            </>
          }
          blurb="A previous-generation AWA 250 has been running at a hotel in Villahermosa, Mexico — feeding the pool boilers, the taps and the balance sheet at once."
        />

        <div className="bf-case-stats">
          {STATS.map((s) => (
            <Reveal key={s.label} className="bf-case-stat" y={34}>
              <strong>
                <Counter to={s.value} prefix={s.prefix} />
                <span className="u">{s.unit}</span>
              </strong>
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>

        <p className="bf-mono-xs" style={{ marginTop: "3.5rem", color: "var(--bf-dim)" }}>
          AWA Modula 250 (previous generation) — hotel integration, Villahermosa, MX
        </p>
      </div>
    </section>
  );
}
