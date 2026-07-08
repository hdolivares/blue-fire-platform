import type { Metadata } from "next";
import "./site.css";
import { siteFontVars } from "@/components/site/fonts";
import SmoothScroll from "@/components/site/SmoothScroll";
import Cursor from "@/components/site/Cursor";
import Preloader from "@/components/site/Preloader";
import SiteNav from "@/components/site/SiteNav";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import Manifesto from "@/components/site/Manifesto";
import Process from "@/components/site/Process";
import Outputs from "@/components/site/Outputs";
import Machines from "@/components/site/Machines";
import Hotels from "@/components/site/Hotels";
import CaseStudy from "@/components/site/CaseStudy";
import Platform from "@/components/site/Platform";
import FinalCta from "@/components/site/FinalCta";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "BlueFire — Pure water, out of thin air",
  description:
    "BlueFire machines condense bottle-grade drinking water from a hotel's own air — and hand the energy back as cooling and 60 °C hot water. One machine, three utilities.",
  openGraph: {
    title: "BlueFire — Pure water, out of thin air",
    description:
      "Atmospheric water generation for hotels: drinking water, cooling and hot water from one machine.",
    type: "website",
  },
};

// Flags JS availability before first paint so above-the-fold intro states
// only hide content when the animations that reveal it will actually run.
const jsFlag = "document.documentElement.classList.add('bf-js');";

export default function LandingPage() {
  return (
    <div id="top" className={`bf ${siteFontVars}`}>
      <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <SiteNav />
      <main id="main">
        <Hero />
        <Marquee />
        <Manifesto />
        <Process />
        <Outputs />
        <Machines />
        <Hotels />
        <CaseStudy />
        <Platform />
        <FinalCta />
      </main>
      <SiteFooter />
      <div className="bf-noise" aria-hidden="true" />
    </div>
  );
}
