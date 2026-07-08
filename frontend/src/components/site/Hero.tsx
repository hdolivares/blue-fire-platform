"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "./gsap";
import { Magnetic } from "./ux";
import { IconArrowRight } from "./assets";
import HeroCanvas from "./HeroCanvas";

/** Sensor-style readout that wanders around its base value. */
function TickValue({
  base,
  spread,
  decimals = 1,
  interval = 1600,
}: {
  base: number;
  spread: number;
  decimals?: number;
  interval?: number;
}) {
  const [v, setV] = useState(base);
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => {
      setV(base + (Math.random() * 2 - 1) * spread);
    }, interval + Math.random() * 600);
    return () => window.clearInterval(id);
  }, [base, spread, interval]);
  return <output>{v.toFixed(decimals)}</output>;
}

const CHIPS: Array<{
  label: string;
  base: number;
  spread: number;
  decimals: number;
  unit: string;
  style: React.CSSProperties;
  className?: string;
}> = [
  {
    label: "Rel. humidity",
    base: 74.2,
    spread: 2.4,
    decimals: 1,
    unit: "%",
    style: { top: "21%", left: "5%" },
  },
  {
    label: "Dew point",
    base: 19.4,
    spread: 0.8,
    decimals: 1,
    unit: "°C",
    style: { top: "27%", right: "7%" },
    className: "bf-hide-sm",
  },
  {
    label: "Condensate",
    base: 416.0,
    spread: 9,
    decimals: 0,
    unit: "L/h",
    style: { top: "13%", left: "36%" },
    className: "bf-hide-md",
  },
  {
    label: "Heat recovery",
    base: 92.1,
    spread: 1.2,
    decimals: 1,
    unit: "%",
    style: { top: "33%", right: "12%" },
    className: "bf-hide-md",
  },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const lines = el.querySelectorAll(".bf-hero-line > span");
      const fades = el.querySelectorAll("[data-hero-fade]");

      const enter = () => {
        if (reducedMotion()) {
          gsap.set(lines, { y: 0, yPercent: 0 });
          gsap.set(fades, { opacity: 1 });
          return;
        }
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .to(lines, { y: 0, yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.05)
          .to(
            fades,
            { opacity: 1, duration: 1.1, ease: "power2.out", stagger: 0.1 },
            0.5
          );
      };

      if (document.documentElement.classList.contains("bf-loaded")) {
        enter();
      } else {
        window.addEventListener("bf:loaded", enter, { once: true });
      }

      if (!reducedMotion()) {
        // gentle float on the HUD chips
        gsap.to(el.querySelectorAll(".bf-hud-chip"), {
          y: "random(-9, 9)",
          duration: "random(3.2, 5)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
        });
        // content drifts up + HUD scatters as you leave the hero
        gsap.to(el.querySelector(".bf-hero-content"), {
          yPercent: -10,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        el.querySelectorAll<HTMLElement>(".bf-hud-chip").forEach((chip, i) => {
          gsap.to(chip, {
            yPercent: -60 - i * 25,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "70% top",
              scrub: true,
            },
          });
        });
      }

      return () => window.removeEventListener("bf:loaded", enter);
    },
    { dependencies: [] }
  );

  return (
    <section ref={ref} className="bf-hero" aria-label="BlueFire — pure water out of thin air">
      <div className="bf-hero-bg" />
      <HeroCanvas />

      <div className="bf-hud" aria-hidden="true">
        {CHIPS.map((c) => (
          <div
            key={c.label}
            className={`bf-hud-chip ${c.className ?? ""}`}
            style={c.style}
          >
            <span>{c.label}</span>
            <TickValue base={c.base} spread={c.spread} decimals={c.decimals} />
            <span>{c.unit}</span>
          </div>
        ))}
      </div>

      <div className="bf-hero-content">
        <div className="bf-wrap bf-hero-grid">
          <div>
            <p className="bf-kicker" data-hero-fade>
              <b>SEAS AWG</b> Atmospheric water generation
            </p>
            <h1 className="bf-display bf-hero-title">
              <span className="bf-hero-line">
                <span>Pure water,</span>
              </span>
              <span className="bf-hero-line">
                <span className="bf-serif-it">out of thin air.</span>
              </span>
            </h1>
          </div>

          <div className="bf-hero-aside">
            <p data-hero-fade>
              BlueFire machines condense drinking water from the air your
              hotel already moves — then hand the energy back as cooling and
              hot water. One machine, three utilities. No wells, no trucks,
              no plastic miles.
            </p>
            <div className="bf-hero-ctas" data-hero-fade>
              <Magnetic>
                <a
                  className="bf-btn bf-btn--solid"
                  href="mailto:jt@bluefire.love?subject=BlueFire%20demo"
                >
                  <span>Book a demo</span>
                  <IconArrowRight className="bf-btn-arrow" />
                </a>
              </Magnetic>
              <a className="bf-btn bf-btn--ghost" href="#system">
                <span>See the system</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bf-wrap bf-hero-meta bf-mono-xs" data-hero-fade>
          <span className="bf-scrollcue">
            <span className="bf-scrollcue-line" />
            Scroll
          </span>
          <span>17.98°N&ensp;92.93°W — pilot live</span>
        </div>
      </div>

      <div className="bf-hero-fade" />
    </section>
  );
}
