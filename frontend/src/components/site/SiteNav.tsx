"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";
import { getLenis, scrollToTarget } from "./lenis-store";
import { LogoMark } from "./assets";

const LINKS = [
  { idx: "01", label: "System", href: "#system" },
  { idx: "02", label: "Machines", href: "#machines" },
  { idx: "03", label: "Hotels", href: "#hotels" },
  { idx: "04", label: "Proof", href: "#proof" },
];

export default function SiteNav() {
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Glass background once scrolled; hide on scroll down, reveal on scroll up.
  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          nav.classList.toggle("is-scrolled", y > 24);
          if (y < 160) {
            nav.classList.remove("is-hidden");
            return;
          }
          nav.classList.toggle("is-hidden", self.direction === 1);
        },
      });
    },
    { dependencies: [] }
  );

  // Lock scroll while the overlay menu is open.
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    return () => {
      getLenis()?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    // wait a beat so the scroll lock releases before Lenis animates
    requestAnimationFrame(() => scrollToTarget(href));
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only bf-mono-xs" style={{ position: "fixed", zIndex: 500, top: 8, left: 8 }}>
        Skip to content
      </a>

      <header ref={navRef} className="bf-nav">
        <div className="bf-wrap bf-nav-inner">
          <Link href="/" className="bf-nav-brand" aria-label="BlueFire — home">
            <LogoMark style={{ width: 26, height: 26 }} gid="bfMarkNav" />
            <span className="bf-nav-wordmark">Bluefire</span>
          </Link>

          <nav className="bf-nav-links" aria-label="Sections">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="bf-nav-link" onClick={(e) => go(e, l.href)}>
                <sup>{l.idx}</sup>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link href="/login" className="bf-btn bf-btn--ghost bf-btn--sm">
              <span>Launch app</span>
            </Link>
            <button
              type="button"
              className={`bf-burger${open ? " is-open" : ""}`}
              aria-expanded={open}
              aria-controls="bf-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="bf-menu" className={`bf-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="bf-menu-link" onClick={(e) => go(e, l.href)} tabIndex={open ? 0 : -1}>
              <span>
                <em>{l.idx}</em>
                {l.label}
              </span>
            </a>
          ))}
          <Link href="/login" className="bf-menu-link" tabIndex={open ? 0 : -1}>
            <span>
              <em>05</em>Launch app
            </span>
          </Link>
        </nav>
        <div className="bf-menu-foot bf-mono-xs">
          <a className="bf-footer-link" href="mailto:jt@bluefire.love">jt@bluefire.love</a>
          <span>Villahermosa, MX</span>
          <span>The sky is an ocean.</span>
        </div>
      </div>
    </>
  );
}
