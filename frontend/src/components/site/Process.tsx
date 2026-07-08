"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { Reveal, SectionHead } from "./ux";
import MachineDiagram from "./MachineDiagram";

const STAGES = [
  {
    idx: "01",
    tag: "Intake",
    title: "Draw the air",
    body: "Warm, humid air is pulled through the intake array — the same air your building already pays to move.",
    datum: "Up to 32,000 m³/h",
  },
  {
    idx: "02",
    tag: "Condense",
    title: "Chill it past dew point",
    body: "Refrigerant coils drop it below its dew point. The vapor lets go of its water, one distilled drop at a time.",
    datum: "−12 °C across the coil",
  },
  {
    idx: "03",
    tag: "Purify",
    title: "Polish every drop",
    body: "Multi-stage filtration and remineralization bring every liter to bottle grade — still or sparkling, meters from the tap.",
    datum: "Up to 10,000 L / day",
  },
  {
    idx: "04",
    tag: "Recover",
    title: "Return the energy",
    body: "The cycle's heat is captured instead of dumped: 60 °C service hot water, plus pre-cooled, dried air for your AC loop.",
    datum: "92% of compressor heat reused",
  },
];

export default function Process() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const pin = root.querySelector<HTMLElement>(".bf-process-pin");
          if (!pin) return;
          const q = gsap.utils.selector(pin);
          const dg = (name: string) =>
            q<SVGElement>(`[data-dg="${name}"]`);

          /* ---------- initial states ---------- */
          const dim = [
            dg("coil"),
            dg("coldplate"),
            dg("tank"),
            dg("comp"),
            dg("filters"),
            dg("glyphwater"),
            dg("glyphhot"),
            dg("glyphcool"),
            dg("labelcoil"),
          ].flat();
          gsap.set(dim, { opacity: 0.24 });
          gsap.set(dg("drops"), { opacity: 0 });
          gsap.set(dg("water"), { scaleY: 0.14, transformOrigin: "50% 100%" });
          gsap.set(
            [dg("pipewater"), dg("pipehot"), dg("pipecool")].flat(),
            { strokeDasharray: 1, strokeDashoffset: 1 }
          );

          /* ---------- ambient life (opacity-gated by stages) ---------- */
          gsap.to(dg("fanblades"), {
            rotation: 360,
            duration: 5.5,
            ease: "none",
            repeat: -1,
            svgOrigin: "235 222",
          });
          gsap.to(dg("led"), {
            opacity: 0.25,
            duration: 1.1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
          gsap.to(dg("airdot"), {
            keyframes: { x: [0, 40, 120, 152], opacity: [0, 1, 1, 0] },
            duration: 2.4,
            ease: "none",
            stagger: { each: 0.45, repeat: -1 },
          });
          gsap.to(dg("drop"), {
            keyframes: { y: [0, 36], opacity: [0, 1, 0] },
            duration: 1.5,
            ease: "power1.in",
            stagger: { each: 0.28, repeat: -1 },
          });

          /* ---------- copy / index stacks ---------- */
          const steps = q<HTMLElement>(".bf-process-step");
          const indices = q<HTMLElement>(".bf-process-idx");
          const railBar = q<HTMLElement>(".bf-process-rail span");
          gsap.set(steps, { autoAlpha: 0, y: 28 });
          gsap.set(steps[0], { autoAlpha: 1, y: 0 });
          gsap.set(indices, { autoAlpha: 0, yPercent: 26 });
          gsap.set(indices[0], { autoAlpha: 1, yPercent: 0 });

          /* ---------- the scrubbed master timeline ---------- */
          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: "+=340%",
              scrub: 0.8,
              pin: true,
              anticipatePin: 1,
            },
          });

          // copy + ghost index crossfades at each stage boundary
          for (let i = 1; i < STAGES.length; i++) {
            tl.to(steps[i - 1], { autoAlpha: 0, y: -26, duration: 0.3 }, i - 0.3)
              .to(indices[i - 1], { autoAlpha: 0, yPercent: -26, duration: 0.3 }, i - 0.3)
              .to(steps[i], { autoAlpha: 1, y: 0, duration: 0.32 }, i)
              .to(indices[i], { autoAlpha: 1, yPercent: 0, duration: 0.32 }, i);
          }
          tl.to(railBar, { yPercent: 300, duration: 4, ease: "none" }, 0);

          // stage 02 — condense
          tl.to(dg("coil"), { opacity: 1, stroke: "#56d9ff", duration: 0.5 }, 0.75)
            .to([dg("coldplate"), dg("labelcoil")].flat(), { opacity: 1, duration: 0.5 }, 0.75)
            .to(dg("drops"), { opacity: 1, duration: 0.4 }, 1.05)
            .to([dg("fan"), dg("grille"), dg("air"), dg("labelin")].flat(), { opacity: 0.35, duration: 0.5 }, 0.75);

          // stage 03 — purify
          tl.to(dg("coil"), { opacity: 0.45, duration: 0.5 }, 1.75)
            .to(dg("coldplate"), { opacity: 0.3, duration: 0.5 }, 1.75)
            .to(dg("tank"), { opacity: 1, duration: 0.5 }, 1.75)
            .to(dg("filters"), { opacity: 1, duration: 0.5 }, 1.8)
            .to(
              [dg("filter0"), dg("filter1"), dg("filter2")].flat(),
              { stroke: "#56d9ff", duration: 0.3, stagger: 0.14 },
              1.95
            )
            .to(dg("water"), { scaleY: 0.85, duration: 1.05, ease: "power1.inOut" }, 1.95)
            .to(dg("pipewater"), { strokeDashoffset: 0, duration: 0.55, ease: "none" }, 2.35)
            .to(dg("glyphwater"), { opacity: 1, duration: 0.35 }, 2.75);

          // stage 04 — recover
          tl.to(dg("comp"), { opacity: 1, duration: 0.5 }, 2.75)
            .to(dg("drops"), { opacity: 0.3, duration: 0.5 }, 2.75)
            .to(dg("pipehot"), { strokeDashoffset: 0, duration: 0.5, ease: "none" }, 3.05)
            .to(dg("glyphhot"), { opacity: 1, duration: 0.35 }, 3.4)
            .to(dg("pipecool"), { strokeDashoffset: 0, duration: 0.6, ease: "none" }, 3.15)
            .to(dg("glyphcool"), { opacity: 1, duration: 0.35 }, 3.6);
        }
      );
    },
    { dependencies: [] }
  );

  return (
    <section ref={rootRef} id="system" className="bf-process">
      <div
        className="bf-wrap"
        style={{ paddingBlock: "clamp(5rem, 10vh, 8rem) clamp(2rem, 4vh, 3rem)" }}
      >
        <SectionHead
          index="01"
          label="The system"
          title={
            <>
              One cycle.{" "}
              <span className="bf-serif-it" style={{ color: "var(--bf-cyan)" }}>
                Three utilities.
              </span>
            </>
          }
          blurb="A refrigeration cycle tuned for buildings: it drinks the humidity your HVAC fights anyway — and wastes none of the heat doing it."
        />
      </div>

      {/* pinned, scroll-scrubbed sequence — desktop with motion */}
      <div className="bf-process-pin">
        <div className="bf-wrap bf-process-screen">
          <div className="bf-process-rail" aria-hidden="true">
            <span />
          </div>

          <div className="bf-process-copy">
            {STAGES.map((s) => (
              <div key={s.idx} className="bf-process-step">
                <p className="bf-kicker">
                  <b>{s.idx}</b> {s.tag}
                </p>
                <h3 className="bf-display bf-h-md">{s.title}</h3>
                <p>{s.body}</p>
                <p className="bf-step-datum bf-mono-sm">{s.datum}</p>
              </div>
            ))}
          </div>

          <div className="bf-diagram-wrap">
            <MachineDiagram gid="dgpin" />
          </div>

          {STAGES.map((s) => (
            <span key={s.idx} className="bf-process-index bf-process-idx" aria-hidden="true">
              {s.idx}
            </span>
          ))}
        </div>
      </div>

      {/* stacked fallback — mobile & reduced motion */}
      <div className="bf-process-stack">
        <div className="bf-wrap">
          <div
            className="bf-diagram-wrap"
            style={{ maxWidth: "40rem", margin: "0 auto 3rem" }}
          >
            <MachineDiagram gid="dgstack" />
          </div>
          {STAGES.map((s) => (
            <Reveal key={s.idx} className="bf-process-card">
              <h3 className="bf-display bf-h-md">
                <em>{s.idx}</em> {s.title}
              </h3>
              <p>{s.body}</p>
              <p className="bf-step-datum bf-mono-sm" style={{ color: "var(--bf-cyan)" }}>
                {s.datum}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
