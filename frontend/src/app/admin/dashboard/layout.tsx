// In frontend/src/app/admin/dashboard/layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

// A simple Sidebar component defined right in the layout
const Sidebar = () => {
  return (
    <div className="w-64 bg-black/20 p-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        <h3 className="font-bold text-lg mb-2">Admin Menu</h3>
        <Link href="/admin/dashboard" className="card-frosted p-3 rounded-lg hover:bg-white/20 transition-colors">
          Dashboard
        </Link>
        <Link href="/dashboard" className="card-frosted p-3 rounded-lg hover:bg-white/20 transition-colors">
          View Projects
        </Link>
        <Link href="/admin/investors" className="card-frosted p-3 rounded-lg hover:bg-white/20 transition-colors">
          Manage Investors
        </Link>
        <Link href="/admin/projects/new" className="card-frosted p-3 rounded-lg hover:bg-white/20 transition-colors">
          Create Project
        </Link>
      </nav>
    </div>
  );
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}