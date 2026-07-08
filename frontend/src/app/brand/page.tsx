import type { Metadata } from "next";
import { BrandGuide } from "@/components/brand/BrandGuide";

export const metadata: Metadata = {
  title: "BlueFire — Brand System",
  description: "The living BlueFire design system: color, type, and components.",
  robots: { index: false, follow: false },
};

export default function BrandPage() {
  return <BrandGuide />;
}
