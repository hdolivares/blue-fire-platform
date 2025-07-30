import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminProjectsLayout({
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