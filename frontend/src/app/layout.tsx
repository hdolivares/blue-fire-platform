import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Web3Provider } from "@/context/Web3Context";
import { ThemeProvider } from "@/context/ThemeContext";
import { LandingLayout } from "@/components/LandingLayout";
import { Toaster } from "react-hot-toast";
import ClientLoadingOverlay from "@/components/ClientLoadingOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blue Fire Platform",
  description: "Blockchain-based water production investment platform",
};

// Runs before React hydration so the correct theme paints immediately (no flash).
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark', d);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <Web3Provider>
              <ClientLoadingOverlay />
              <LandingLayout>
                <Toaster position="top-center" />
                {children}
              </LandingLayout>
            </Web3Provider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
