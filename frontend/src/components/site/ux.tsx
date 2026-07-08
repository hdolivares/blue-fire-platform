"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, reducedMotion } from "./gsap";

/* ------------------------------------------------------------------ */
/* SplitLines — masked line-by-line heading reveal (reverts after run) */
/* ------------------------------------------------------------------ */
export function SplitLines({
  as = "h2",
  className,
  children,
  start = "top 85%",
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  start?: string;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      let cancelled = false;
      const run = contextSafe!(() => {
        if (cancelled || !el.isConnected) return;
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 118,
              duration: 1.15,
              ease: "power4.out",
              stagger: 0.09,
              scrollTrigger: { trigger: el, start, once: true },
              // restore the original DOM once done so masks never clip
              // italic descenders at rest
              onComplete: () => self.revert(),
            }),
        });
      });
      // split only after webfonts settle, so line breaks are final
      document.fonts.ready.then(run);
      return () => {
        cancelled = true;
      };
    },
    { dependencies: [] }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Counter — counts up when scrolled into view; SSR renders the target */
/* ------------------------------------------------------------------ */
export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2.2,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) =>
    prefix +
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const obj = { v: 0 };
      el.textContent = fmt(0);
      gsap.to(obj, {
        v: to,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = fmt(obj.v);
        },
      });
    },
    { dependencies: [to] }
  );

  return (
    <span ref={ref} className={className}>
      {fmt(to)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — fade/rise a block (or its children) on first view         */
/* ------------------------------------------------------------------ */
export function Reveal({
  as = "div",
  className,
  children,
  y = 30,
  delay = 0,
  stagger = 0,
  targets,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  y?: number;
  delay?: number;
  stagger?: number;
  /** CSS selector — animate matching descendants instead of the wrapper */
  targets?: string;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const items = targets
        ? gsap.utils.toArray<HTMLElement>(targets, el)
        : [el];
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: "power3.out",
        delay,
        stagger,
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      });
    },
    { dependencies: [] }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — element leans toward the pointer (fine pointers only)   */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches)
        return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      };
    },
    { dependencies: [] }
  );

  return (
    <div ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHead — numbered kicker + display title + optional lede      */
/* ------------------------------------------------------------------ */
export function SectionHead({
  index,
  label,
  title,
  blurb,
  className = "",
}: {
  index: string;
  label: string;
  title: ReactNode;
  blurb?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`bf-shead ${className}`}>
      <p className="bf-kicker">
        <b>{index}</b> {label}
      </p>
      <SplitLines as="h2" className="bf-display bf-h-lg">
        {title}
      </SplitLines>
      {blurb ? (
        <Reveal as="p" className="bf-lede">
          {blurb}
        </Reveal>
      ) : null}
    </header>
  );
}
