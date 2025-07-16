import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AnimatedGradientProvider } from "@/components/AnimatedGradientProvider";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";
import ClientLoadingOverlay from "@/components/ClientLoadingOverlay";
import ClientAdminBar from "@/components/ClientAdminBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blue Fire Platform",
  description: "Blockchain-based water production investment platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ClientLoadingOverlay />
          <ClientAdminBar />
          <AnimatedGradientProvider />
          <Header />
          <Toaster position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}