import Link from "next/link";
import { SectionHead } from "./ux";
import { IconArrowUpRight } from "./assets";

const TRACKS = [
  {
    idx: "A",
    title: "Invest",
    body: "Fund a unit and hold an ERC-721 position in that specific machine. Water sells, revenue distributes pro-rata, you claim on-chain.",
    cta: "Start investing",
    href: "/register",
  },
  {
    idx: "B",
    title: "Operate",
    body: "Run the water business on a hosted machine — pricing, customers, deliveries — with performance tools and revenue rails built in.",
    cta: "Become an operator",
    href: "/register",
  },
];

export default function Platform() {
  return (
    <section className="bf-platform">
      <div className="bf-wrap">
        <SectionHead
          index="06"
          label="The platform"
          title={
            <>
              Own the{" "}
              <span className="bf-serif-it" style={{ color: "var(--bf-cyan)" }}>
                machine.
              </span>
            </>
          }
          blurb="Every BlueFire unit is funded as its own on-chain project — one machine, one contract, transparent flows from water sold to yield claimed."
        />

        <div className="bf-platform-grid">
          {TRACKS.map((t) => (
            <Link key={t.idx} href={t.href} className="bf-pcard">
              <span className="bf-mono-xs" style={{ color: "var(--bf-cyan)" }}>
                {t.idx} / Path
              </span>
              <h3 className="bf-display bf-h-md">{t.title}</h3>
              <p>{t.body}</p>
              <span className="bf-link bf-pcard-cta">
                {t.cta}
                <IconArrowUpRight style={{ width: "0.9em", height: "0.9em" }} />
              </span>
            </Link>
          ))}
        </div>

        <p className="bf-mono-xs" style={{ marginTop: "1.6rem", color: "var(--bf-dim)" }}>
          Running on Rootstock (RSK) — audited contracts, 100% test coverage
        </p>
      </div>
    </section>
  );
}
