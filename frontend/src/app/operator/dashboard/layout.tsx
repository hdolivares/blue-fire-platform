// In frontend/src/app/operator/dashboard/layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function OperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Protect this route for users with the 'Operator' role
    <ProtectedRoute roles={['Operator']}>
      {children}
    </ProtectedRoute>
  );
}