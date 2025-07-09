// In frontend/src/app/dashboard/layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={['Investor', 'Admin']}>
      {children}
    </ProtectedRoute>
  );
}