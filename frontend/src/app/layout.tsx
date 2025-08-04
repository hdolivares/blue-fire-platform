import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Web3Provider } from "@/context/Web3Context";
import { LandingLayout } from "@/components/LandingLayout";
import { Toaster } from "react-hot-toast";
import ClientLoadingOverlay from "@/components/ClientLoadingOverlay";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins"
});

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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${poppins.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <Web3Provider>
            <ClientLoadingOverlay />
            {/* <ClientAdminBar /> */}
            <LandingLayout>
              <Toaster position="top-center" />
              {children}
            </LandingLayout>
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  );
}