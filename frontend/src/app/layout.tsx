import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { AnimatedGradientProvider } from "@/components/AnimatedGradientProvider";
import { AdminBar } from "@/components/AdminBar";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { LoadingOverlay } from "@/components/LoadingOverlay";

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
          <LoadingOverlay />
          <Toaster position="top-center" />
          <AdminBar />
          <AnimatedGradientProvider />
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}