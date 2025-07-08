// In frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AnimatedGradientProvider } from "@/components/AnimatedGradientProvider"; // Import our new provider

export const metadata: Metadata = {
  title: "Blue Fire Platform",
  description: "Decentralized Water & Energy Infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <AnimatedGradientProvider /> {/* Use the new provider component */}
        {children}
      </body>
    </html>
  );
}