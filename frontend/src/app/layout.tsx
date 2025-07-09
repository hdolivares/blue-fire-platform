// In frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { AnimatedGradientProvider } from "@/components/AnimatedGradientProvider";
import { AdminBar } from "@/components/AdminBar"; // Import the new component
import { Header } from "@/components/Header"; // Import our new Header


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
        <AuthProvider>
          <AdminBar /> {/* Add the admin bar here */}
          <AnimatedGradientProvider />
          <Header /> {/* Add the Header here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}