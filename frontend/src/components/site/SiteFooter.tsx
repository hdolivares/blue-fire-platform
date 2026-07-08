import Link from "next/link";
import { LogoMark } from "./assets";

export default function SiteFooter() {
  return (
    <footer className="bf-footer">
      <div className="bf-wrap">
        <div className="bf-footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <LogoMark style={{ width: 30, height: 30 }} gid="bfMarkFoot" />
              <span className="bf-nav-wordmark" style={{ fontSize: "1.05rem" }}>
                Bluefire
              </span>
            </div>
            <p className="bf-footer-tagline">
              Atmospheric water systems that pour drinking water out of a
              hotel&rsquo;s own air — and pay for it with recovered heat.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li><a className="bf-footer-link" href="#system">The system</a></li>
              <li><a className="bf-footer-link" href="#machines">Machines</a></li>
              <li><a className="bf-footer-link" href="#hotels">For hotels</a></li>
              <li><a className="bf-footer-link" href="#proof">Proof</a></li>
            </ul>
          </div>

          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link className="bf-footer-link" href="/login">Launch app</Link></li>
              <li><Link className="bf-footer-link" href="/register">Create account</Link></li>
              <li><Link className="bf-footer-link" href="/dashboard">Investor dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a className="bf-footer-link" href="mailto:jt@bluefire.love">jt@bluefire.love</a>
              </li>
              <li>
                <a className="bf-footer-link" href="mailto:lgg@seas-sa.com">lgg@seas-sa.com</a>
              </li>
              <li><span className="bf-footer-link" style={{ cursor: "default" }}>Villahermosa, MX</span></li>
            </ul>
          </div>
        </div>

        <div className="bf-footer-meta bf-mono-xs">
          <span>&copy; 2026 Blue Fire. All rights reserved.</span>
          <a className="bf-footer-link bf-mono-xs" href="#top">Back to top</a>
          <span>The sky is an ocean.</span>
        </div>
      </div>

      <div className="bf-footer-mark" aria-hidden="true">
        Bluefire
      </div>
    </footer>
  );
}
