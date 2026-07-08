"use client";

import { Counter, Reveal, SectionHead } from "./ux";
import { IconDrop, IconFlame, IconSnow } from "./assets";

const OUTPUTS = [
  {
    accent: "water",
    idx: "A",
    icon: IconDrop,
    name: "Drink",
    value: 10000,
    unit: "liters / day",
    body: "Bottle-grade still & sparkling, mineralized on site. Your house water, poured meters from where it condensed.",
  },
  {
    accent: "cold",
    idx: "B",
    icon: IconSnow,
    name: "Cool",
    value: 32000,
    unit: "m³ / hour of dry air",
    body: "Pre-chilled, dehumidified air feeds straight into your air handlers — lighter loads, drier rooms, quieter plant.",
  },
  {
    accent: "heat",
    idx: "C",
    icon: IconFlame,
    name: "Heat",
    value: 8000,
    unit: "liters / hour at 60 °C",
    body: "Condenser heat becomes service hot water for laundry, kitchens and showers — instead of leaving through the roof.",
  },
] as const;

export default function Outputs() {
  return (
    <section className="bf-outputs">
      <div className="bf-wrap">
        <SectionHead
          index="02"
          label="The outputs"
          title={
            <>
              Every watt leaves{" "}
              <span className="bf-serif-it" style={{ color: "var(--bf-cyan)" }}>
                three times.
              </span>
            </>
          }
          blurb="A BlueFire unit is metered like a utility plant: one power input, three billable streams out."
        />

        <Reveal className="bf-outputs-grid" targets=".bf-output" stagger={0.12} y={40}>
          {OUTPUTS.map((o) => {
            const Icon = o.icon;
            return (
              <article key={o.name} className="bf-output" data-accent={o.accent}>
                <div className="bf-output-head">
                  <span className="bf-mono-xs">{o.idx} / Output</span>
                  <Icon />
                </div>
                <div>
                  <p className="bf-output-value">
                    <Counter to={o.value} />
                    <small>{o.unit}</small>
                  </p>
                </div>
                <div>
                  <h3 className="bf-display bf-h-md">{o.name}</h3>
                  <p>{o.body}</p>
                </div>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
