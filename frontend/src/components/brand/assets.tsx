import type { SVGProps } from "react";

/* Generated BlueFire brand assets — everything is drawn in code, no bitmaps.
   Shared by the landing (src/components/site) and the app (header, favicon,
   brand guide). */

/** Droplet with a flame cut out of its core — water made by heat. */
export function LogoMark({
  gid = "bfMark",
  ...props
}: SVGProps<SVGSVGElement> & { gid?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={gid} x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#56d9ff" />
          <stop offset="0.62" stopColor="#19a8e6" />
          <stop offset="1" stopColor="#1467d2" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 3.6C24 3.6 9.6 19.7 9.6 30a14.4 14.4 0 1 0 28.8 0C38.4 19.7 24 3.6 24 3.6Zm0 13.6c3.3 3.5 6.4 7.6 6.4 11.6a6.4 6.4 0 1 1-12.8 0c0-2.4 1.2-4.7 2.8-6.7-.3 2 .4 3.6 1.9 4.6-.5-3.2.4-6.5 1.7-9.5Z"
      />
    </svg>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconDrop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...stroke} d="M12 3.2S5.8 10.4 5.8 15a6.2 6.2 0 1 0 12.4 0C18.2 10.4 12 3.2 12 3.2Z" />
      <path {...stroke} strokeOpacity={0.55} d="M9.2 14.6a2.9 2.9 0 0 0 2.5 3.2" />
    </svg>
  );
}

export function IconSnow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...stroke} d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
      <path {...stroke} strokeOpacity={0.55} d="M12 3l-2 2.2M12 3l2 2.2M12 21l-2-2.2M12 21l2-2.2" />
    </svg>
  );
}

export function IconFlame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...stroke}
        d="M12 3.5c1.9 2.6 6 5.9 6 10.5a6 6 0 1 1-12 0c0-2 1-4 2.4-5.8-.2 2 .5 3.4 1.9 4.3-.6-3 .3-6.3 1.7-9Z"
      />
    </svg>
  );
}

export function IconWind(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...stroke} d="M3 8.5h11a2.6 2.6 0 1 0-2.5-3.3" />
      <path {...stroke} d="M3 12.5h15.5a2.8 2.8 0 1 1-2.6 3.7" />
      <path {...stroke} strokeOpacity={0.55} d="M3 16.5h7" />
    </svg>
  );
}

export function IconFilter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...stroke} d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function IconArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...stroke} d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />
    </svg>
  );
}

export function IconArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...stroke} d="M6 18 18 6m0 0H8.5M18 6v9.5" />
    </svg>
  );
}
