"use client";

import { Magnetic, Reveal, SectionHead } from "./ux";
import { IconArrowRight } from "./assets";

const BENEFITS = [
  {
    idx: "01",
    title: "Cut the boiler",
    body: "Recovered condenser heat displaces LPG and resistive heating for pools, laundry and showers. The Villahermosa pilot burns 210 fewer liters of gas every single day.",
  },
  {
    idx: "02",
    title: "Pour your own label",
    body: "Still or sparkling, remineralized to your taste, bottled in glass on premise. Guests drink the house water — the story tells itself at every table.",
  },
  {
    idx: "03",
    title: "Dry, pre-cooled air",
    body: "The byproduct air stream is chilled and dehumidified before it reaches your air handlers. Lighter HVAC loads, crisper rooms, and mold loses its climate.",
  },
  {
    idx: "04",
    title: "Zero CAPEX",
    body: "Units are financed by investors on the BlueFire platform. You host the machine and buy the outputs — no capital line, no maintenance risk.",
  },
  {
    idx: "05",
    title: "ESG guests can taste",
    body: "No trucked bottles, no plastic miles, no groundwater drawn. Every liter and kilowatt is metered — impact you can print in the annual report.",
  },
];

export default function Hotels() {
  return (
    <section id="hotels" className="bf-hotels">
      <div className="bf-wrap bf-hotels-layout">
        <div className="bf-hotels-sticky">
          <SectionHead
            index="04"
            label="For hotels"
            title={
              <>
                Your building is a{" "}
                <span className="bf-serif-it" style={{ color: "var(--bf-cyan)" }}>
                  reservoir.
                </span>
              </>
            }
            blurb="A 200-key resort moves tonnes of humid air an hour and burns fuel to heat water it trucks in to drink. BlueFire turns that round trip into a loop."
          />
          <div style={{ marginTop: "2.4rem" }}>
            <Magnetic>
              <a
                className="bf-btn bf-btn--solid"
                href="mailto:jt@bluefire.love?subject=BlueFire%20for%20our%20property"
              >
                <span>Run the numbers for my property</span>
                <IconArrowRight className="bf-btn-arrow" />
              </a>
            </Magnetic>
          </div>
        </div>

        <div>
          {BENEFITS.map((b, i) => (
            <Reveal key={b.idx} className="bf-brow" y={36} delay={i * 0.04}>
              <span className="bf-brow-idx">{b.idx}</span>
              <div>
                <h3 className="bf-display bf-h-md">{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
