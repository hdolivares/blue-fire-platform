// In frontend/src/components/Header.tsx
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 card-frosted">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/dashboard" className="text-xl font-bold">
          Blue Fire
        </Link>
        <UserMenu />
      </div>
    </header>
  );
};