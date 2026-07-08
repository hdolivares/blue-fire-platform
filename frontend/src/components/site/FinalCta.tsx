import Link from "next/link";
import { Magnetic, SplitLines } from "./ux";
import { IconArrowRight } from "./assets";

export default function FinalCta() {
  return (
    <section className="bf-cta">
      <div className="bf-wrap bf-cta-inner">
        <p className="bf-kicker">
          <b>07</b> Next step
        </p>
        <SplitLines as="h2" className="bf-display bf-cta-title">
          Put your air <span className="bf-serif-it">to work.</span>
        </SplitLines>
        <div className="bf-cta-actions">
          <Magnetic>
            <a
              className="bf-btn bf-btn--solid"
              href="mailto:jt@bluefire.love?subject=BlueFire%20demo"
            >
              <span>Book a demo</span>
              <IconArrowRight className="bf-btn-arrow" />
            </a>
          </Magnetic>
          <Link className="bf-btn bf-btn--ghost" href="/login">
            <span>Launch the app</span>
          </Link>
        </div>
        <p className="bf-mono-xs" style={{ color: "var(--bf-dim)" }}>
          jt@bluefire.love&ensp;·&ensp;Villahermosa, MX
        </p>
      </div>
    </section>
  );
}
