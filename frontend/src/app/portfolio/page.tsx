// In frontend/src/app/portfolio/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { PortfolioCard } from '@/components/PortfolioCard';

export default function PortfolioPage() {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3001/investors/my-portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPortfolio(response.data);
      })
      .catch(error => console.error("Failed to fetch portfolio", error))
      .finally(() => setLoading(false));
    } else if (token === null) {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Loading Portfolio...</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">My Portfolio</h1>
      <div className="space-y-6">
        {portfolio.length > 0 ? portfolio.map(investment => (
          <PortfolioCard key={investment._id} investment={investment} />
        )) : (
          <div className="card-frosted p-8 text-center">
            <p>You have not invested in any projects yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}