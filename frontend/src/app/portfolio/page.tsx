// In frontend/src/app/portfolio/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { PortfolioCard } from '@/components/PortfolioCard';
import { Card } from '@/components/ui/Card';

export default function PortfolioPage() {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/investors/my-portfolio')
        .then((response: any) => {
          setPortfolio(response.data);
        })
        .catch((error: any) => console.error("Failed to fetch portfolio", error))
        .finally(() => setLoading(false));
    } else if (token === null) {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Loading Portfolio...</div>;
  }

  return (
    <main className="container-main">
      <h1 className="section-header">My Portfolio</h1>
      <div className="space-y-6">
        {portfolio.length > 0 ? portfolio.map(investment => (
          <PortfolioCard key={investment._id} investment={investment} />
        )) : (
          <Card variant="frosted" className="p-8 text-center">
            <p className="text-secondary">You have not invested in any projects yet.</p>
          </Card>
        )}
      </div>
    </main>
  );
}