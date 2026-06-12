// In frontend/src/components/Header.tsx
'use client';

import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { WalletControls } from "./WalletControls";
import { ThemeToggle } from "./ThemeToggle";
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
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-on-brand text-sm">
              BF
            </span>
            <span className="gradient-brand-text">Blue Fire</span>
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
