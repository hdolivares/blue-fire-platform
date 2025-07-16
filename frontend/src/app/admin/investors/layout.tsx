import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminInvestorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      {children}
    </ProtectedRoute>
  );
} 