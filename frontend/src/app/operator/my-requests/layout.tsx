import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function OperatorMyRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRoles={['Operator']}>
      {children}
    </ProtectedRoute>
  );
} 