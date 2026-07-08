import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

// Landing-only typefaces, declared here (not in the root layout) so they are
// preloaded on `/` without weighing down the app routes.

// Archivo variable — [wdth 62–125, wght 100–900]. The width axis is the
// backbone of the display system (expanded caps / condensed data).
export const archivo = localFont({
  src: "../../fonts/archivo-latin-wdth-normal.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

// Instrument Serif — the editorial italic voice.
export const instrument = localFont({
  src: [
    {
      path: "../../fonts/instrument-serif-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/instrument-serif-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument",
  display: "swap",
});

// Geist Mono ships locally with the `geist` package — HUD/spec microcopy.
export const mono = GeistMono;

export const siteFontVars = `${archivo.variable} ${instrument.variable} ${mono.variable}`;
