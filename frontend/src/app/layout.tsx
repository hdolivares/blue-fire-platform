import type { Metadata } from "next";
import "./globals.css";
import { archivo, instrument, mono } from "./fonts";
import { AuthProvider } from "@/context/AuthContext";
import { Web3Provider } from "@/context/Web3Context";
import { ThemeProvider } from "@/context/ThemeContext";
import { LandingLayout } from "@/components/LandingLayout";
import { Toaster } from "react-hot-toast";
import ClientLoadingOverlay from "@/components/ClientLoadingOverlay";

export const metadata: Metadata = {
  title: "BlueFire — Pure water, out of thin air",
  description:
    "BlueFire condenses drinking water from air and returns the energy as cooling and hot water — one machine, three utilities. Fund and operate on-chain.",
};

// Runs before React hydration so the correct theme paints immediately (no flash).
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark', d);}catch(e){document.documentElement.classList.add('dark');}})();`;

// Toast surface tuned to the token system so notifications sit inside the brand
// in both themes (react-hot-toast defaults to a white card otherwise).
const toastOptions = {
  style: {
    background: "var(--surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-lg)",
    borderRadius: "0.625rem",
    fontSize: "0.875rem",
  },
  success: { iconTheme: { primary: "var(--success)", secondary: "var(--surface-elevated)" } },
  error: { iconTheme: { primary: "var(--danger)", secondary: "var(--surface-elevated)" } },
  loading: { iconTheme: { primary: "var(--brand-primary)", secondary: "var(--surface-elevated)" } },
};

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
      <body
        className={`${archivo.variable} ${instrument.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <Web3Provider>
              <ClientLoadingOverlay />
              <LandingLayout>
                <Toaster position="top-center" toastOptions={toastOptions} />
                {children}
              </LandingLayout>
            </Web3Provider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
