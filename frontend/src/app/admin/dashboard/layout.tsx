// In frontend/src/app/admin/dashboard/layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

// A simple Sidebar component defined right in the layout
const Sidebar = () => {
  return (
    <div className="w-64 bg-black/20 p-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        <h3 className="font-bold text-lg mb-2">Admin Menu</h3>
        <Card variant="frosted" className="p-3 rounded-lg hover:bg-white/20 transition-colors">
          <Link href="/admin/dashboard">
            Dashboard
          </Link>
        </Card>
        <Card variant="frosted" className="p-3 rounded-lg hover:bg-white/20 transition-colors">
          <Link href="/admin/projects">
            Manage Projects
          </Link>
        </Card>
        <Card variant="frosted" className="p-3 rounded-lg hover:bg-white/20 transition-colors">
          <Link href="/admin/investors">
            Manage Investors
          </Link>
        </Card>
        <Card variant="frosted" className="p-3 rounded-lg hover:bg-white/20 transition-colors">
          <Link href="/admin/projects/new">
            Create Project
          </Link>
        </Card>
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