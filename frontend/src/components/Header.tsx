// In frontend/src/components/Header.tsx
'use client';

import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { WalletControls } from "./WalletControls";
import { ThemeToggle } from "./ThemeToggle";
import { LogoMark } from "./brand/assets";
import { useScrolled } from "@/hooks/useScrolled";

export const Header = () => {
  const scrolled = useScrolled();

  return (
    <header
      className="app-header sticky top-0 z-50"
      data-solid="true"
      data-scrolled={scrolled}
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Left side: Logo and Wallet Controls */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            aria-label="BlueFire — dashboard"
          >
            <LogoMark gid="bfHeaderMark" className="h-7 w-7" />
            <span
              className="font-display text-[0.95rem] uppercase tracking-[0.14em] text-text-primary"
              style={{ fontStretch: "120%", fontWeight: 760 }}
            >
              BlueFire
            </span>
          </Link>
          <WalletControls />
        </div>

        {/* Right side: Theme toggle + User Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
