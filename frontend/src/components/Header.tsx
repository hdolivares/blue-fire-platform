// In frontend/src/components/Header.tsx
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { WalletControls } from "./WalletControls";
import { Card } from "./ui/Card";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50">
      <Card variant="frosted" className="rounded-none border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/dashboard" className="text-xl font-bold">
            Blue Fire
          </Link>
          
          <div className="flex items-center gap-4">
            <WalletControls />
            <UserMenu />
          </div>
        </div>
      </Card>
    </header>
  );
};