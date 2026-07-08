"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "./gsap";
import { SectionHead } from "./ux";

const MODELS = [
  {
    id: "250",
    name: "AWA Modula 250",
    water: 2500,
    hot: 2000,
    air: 8000,
    scale: 0.86,
    audience: "Boutique hotels, residential complexes, light industry.",
  },
  {
    id: "500",
    name: "AWA Modula 500",
    water: 5000,
    hot: 4000,
    air: 16000,
    scale: 1,
    audience: "Hospitals, large resorts, data centers, manufacturing.",
  },
  {
    id: "1000",
    name: "AWA Modula 1000",
    water: 10000,
    hot: 8000,
    air: 32000,
    scale: 1.13,
    audience: "Industrial parks, bottling lines, remote communities.",
  },
] as const;

/** Tweens between spec values when the selected model changes. */
function SpecValue({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reducedMotion()) {
        shown.current = value;
        el.textContent = value.toLocaleString("en-US");
        return;
      }
      const obj = { v: shown.current };
      gsap.to(obj, {
        v: value,
        duration: 0.75,
        ease: "power2.out",
        onUpdate: () => {
          shown.current = obj.v;
          el.textContent = Math.round(obj.v).toLocaleString("en-US");
        },
      });
    },
    { dependencies: [value] }
  );

  return <span ref={ref}>{value.toLocaleString("en-US")}</span>;
}

/** Generated front elevation of the AWA Modula unit. */
function MachineRender() {
  return (
    <svg
      viewBox="0 0 420 560"
      fill="none"
      className="bf-machine-svg"
      role="img"
      aria-label="AWA Modula atmospheric water unit"
    >
      <defs>
        <linearGradient id="bfmPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e2040" />
          <stop offset="0.5" stopColor="#0a1730" />
          <stop offset="1" stopColor="#071021" />
        </linearGradient>
        <linearGradient id="bfmWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#56d9ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#1467d2" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* cabinet */}
      <rect x="90" y="42" width="240" height="460" rx="20" fill="url(#bfmPanel)" stroke="rgba(150,198,255,0.3)" strokeWidth="1.5" />
      <path d="M90 150 H330 M90 330 H330" stroke="rgba(140,190,255,0.14)" strokeWidth="1" />

      {/* intake vents */}
      <g stroke="rgba(183,217,247,0.5)" strokeWidth="2" strokeLinecap="round">
        {[72, 88, 104, 120, 136].map((y) => (
          <path key={y} d={`M118 ${y} H302`} />
        ))}
      </g>

      {/* status ring + droplet core */}
      <circle cx="210" cy="242" r="40" stroke="rgba(86,217,255,0.5)" strokeWidth="1.5" data-m="ring" />
      <circle cx="210" cy="242" r="52" stroke="rgba(86,217,255,0.16)" strokeWidth="1" data-m="ring2" />
      <path
        d="M210 220s-13 14.8-13 24a13 13 0 1 0 26 0c0-9.2-13-24-13-24Z"
        fill="rgba(86,217,255,0.14)"
        stroke="#56d9ff"
        strokeWidth="1.6"
      />

      {/* water level window */}
      <rect x="126" y="360" width="16" height="110" rx="8" stroke="rgba(150,198,255,0.3)" strokeWidth="1.5" />
      <rect x="130" y="394" width="8" height="72" rx="4" fill="url(#bfmWater)" data-m="level" />

      {/* spec plate */}
      <rect x="176" y="392" width="126" height="52" rx="6" stroke="rgba(140,190,255,0.2)" strokeWidth="1" />
      <text
        x="190"
        y="413"
        style={{
          fontFamily: "var(--bf-font-mono, monospace)",
          fontSize: "10px",
          letterSpacing: "0.18em",
          fill: "#6d8fbc",
          textTransform: "uppercase",
        }}
      >
        AWA MODULA
      </text>
      <text
        x="190"
        y="432"
        style={{
          fontFamily: "var(--bf-font-mono, monospace)",
          fontSize: "10px",
          letterSpacing: "0.18em",
          fill: "#56d9ff",
        }}
      >
        SEAS · BLUEFIRE
      </text>

      {/* output ports */}
      <g strokeWidth="1.5">
        <circle cx="352" cy="380" r="7" stroke="#b7d9f7" />
        <circle cx="352" cy="410" r="7" stroke="#ff7847" />
        <circle cx="352" cy="440" r="7" stroke="#56d9ff" />
        <path d="M330 380 h15 M330 410 h15 M330 440 h15" stroke="rgba(150,198,255,0.3)" />
      </g>

      {/* base */}
      <rect x="74" y="502" width="272" height="16" rx="6" fill="rgba(11,27,54,0.8)" stroke="rgba(150,198,255,0.22)" strokeWidth="1.5" />
      <path d="M110 518 v14 M310 518 v14" stroke="rgba(150,198,255,0.3)" strokeWidth="3" strokeLinecap="round" />

      {/* ground shadow */}
      <ellipse cx="210" cy="544" rx="150" ry="9" fill="rgba(86,217,255,0.06)" />
    </svg>
  );
}

export default function Machines() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(1);
  const model = MODELS[active];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion()) return;
      gsap.to(root.querySelector(".bf-machine-svg"), {
        scale: model.scale,
        duration: 0.9,
        ease: "power3.out",
        transformOrigin: "50% 100%",
      });
      gsap.fromTo(
        root.querySelector(".bf-machine-num"),
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(
        root.querySelector(".bf-machine-audience"),
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    },
    { dependencies: [active] }
  );

  // idle pulse on the status ring
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion()) return;
      gsap.to(root.querySelectorAll('[data-m="ring2"]'), {
        opacity: 0.35,
        scale: 1.12,
        transformOrigin: "50% 50%",
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    },
    { dependencies: [] }
  );

  return (
    <section ref={rootRef} id="machines" className="bf-machines">
      <div className="bf-wrap">
        <SectionHead
          index="03"
          label="The machines"
          title={
            <>
              One family.{" "}
              <span className="bf-serif-it" style={{ color: "var(--bf-cyan)" }}>
                Three scales.
              </span>
            </>
          }
          blurb="Same thermodynamic cycle, bigger lungs — from a boutique courtyard to a bottling line."
        />

        <div className="bf-machines-layout">
          <div>
            <div className="bf-mtabs" role="group" aria-label="Choose a model">
              {MODELS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className="bf-mtab"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                >
                  <span>
                    <em>{String(i + 1).padStart(2, "0")}&ensp;</em>
                    {m.name}
                  </span>
                  <span>{m.water.toLocaleString("en-US")} L/d</span>
                </button>
              ))}
            </div>

            <dl className="bf-specs">
              <div className="bf-spec">
                <dt>Water production</dt>
                <dd>
                  <SpecValue value={model.water} />
                  <small>L / day</small>
                </dd>
              </div>
              <div className="bf-spec">
                <dt>Hot water output</dt>
                <dd>
                  <SpecValue value={model.hot} />
                  <small>L / hour</small>
                </dd>
              </div>
              <div className="bf-spec">
                <dt>Fresh cool air</dt>
                <dd>
                  <SpecValue value={model.air} />
                  <small>m³ / hour</small>
                </dd>
              </div>
              <div className="bf-spec">
                <dt>Designed for</dt>
                <dd className="bf-machine-audience" style={{ fontSize: "0.92rem", fontWeight: 480, maxWidth: "17em" }}>
                  {model.audience}
                </dd>
              </div>
            </dl>

            <p style={{ marginTop: "2rem" }}>
              <a className="bf-link" href="mailto:jt@bluefire.love?subject=BlueFire%20sizing">
                Talk sizing with an engineer
              </a>
            </p>
          </div>

          <div className="bf-machine-stage">
            <span className="bf-machine-num" aria-hidden="true">
              {model.id}
            </span>
            <MachineRender />
          </div>
        </div>
      </div>
    </section>
  );
}
