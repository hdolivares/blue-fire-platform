// frontend/src/app/portfolio/layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    // Protect this route for Investors and Admins
    <ProtectedRoute roles={['Investor', 'Admin']}>
      {children}
    </ProtectedRoute>
  );
}