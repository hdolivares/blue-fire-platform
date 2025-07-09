// In frontend/src/components/UserMenu.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        // If user is logged in
        <>
          <span className="text-sm">Welcome, {user.email}</span>
          <button
            onClick={handleLogout}
            className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-all hover:bg-white/20"
          >
            Log Out
          </button>
        </>
      ) : (
        // If user is logged out
        <>
          <Link href="/login" className="text-sm font-semibold hover:underline">
            Log In
          </Link>
          <Link href="/register" className="bg-gradient-accent text-white font-bold py-2 px-4 rounded-lg transition-all hover:brightness-110">
            Register
          </Link>
        </>
      )}
    </div>
  );
};