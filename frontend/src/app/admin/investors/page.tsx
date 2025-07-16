'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface Investor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  walletAddress: string;
  country: string;
  createdAt: string;
}

interface Investment {
  _id: string;
  amount: number;
  createdAt: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    walletAddress: string;
  };
  project: {
    _id: string;
    projectName: string;
    location: string;
    status: string;
    fundingGoal: number;
    currentFunding: number;
  };
}

interface InvestorStats {
  totalInvestors: number;
  totalInvestments: number;
  totalInvestmentAmount: number;
  averageInvestmentPerInvestor: number;
}

export default function AdminInvestorsPage() {
  const { user } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'investors' | 'investments'>('investors');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [investorsRes, investmentsRes, statsRes] = await Promise.all([
          api.get('/admin/investors'),
          api.get('/admin/investments'),
          api.get('/admin/investor-stats'),
        ]);
        
        setInvestors(investorsRes.data);
        setInvestments(investmentsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    // Use a consistent date format to avoid hydration mismatches
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}, ${year}`;
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getInvestorTotalInvestment = (investorId: string) => {
    return investments
      .filter(inv => inv.user._id === investorId)
      .reduce((total, inv) => total + inv.amount, 0);
  };

  const getInvestorInvestmentCount = (investorId: string) => {
    return investments.filter(inv => inv.user._id === investorId).length;
  };

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">Loading investor data...</div>
      </main>
    );
  }

  return (
    <main className="container-main">
      <div className="mb-8">
        <h1 className="section-header">Investor Management</h1>
        <p className="text-secondary">Manage and monitor all active investors and their investments</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Investors" 
            value={stats.totalInvestors.toString()} 
          />
          <StatCard 
            title="Total Investments" 
            value={stats.totalInvestments.toString()} 
          />
          <StatCard 
            title="Total Investment Amount" 
            value={`$${stats.totalInvestmentAmount.toLocaleString()}`} 
          />
          <StatCard 
            title="Avg. Investment/Investor" 
            value={`$${stats.averageInvestmentPerInvestor.toLocaleString()}`} 
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setActiveTab('investors')}
          variant={activeTab === 'investors' ? 'primary' : 'outline'}
          size="sm"
        >
          Investors ({investors.length})
        </Button>
        <Button
          onClick={() => setActiveTab('investments')}
          variant={activeTab === 'investments' ? 'primary' : 'outline'}
          size="sm"
        >
          Investments ({investments.length})
        </Button>
      </div>

      {/* Investors Tab */}
      {activeTab === 'investors' && (
        <Card variant="frosted" className="p-6">
          <h2 className="section-header">Active Investors</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Wallet</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Investments</th>
                  <th className="text-left py-3 px-4">Total Invested</th>
                  <th className="text-left py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((investor) => (
                  <tr key={investor._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold">{investor.firstName} {investor.lastName}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-secondary">{investor.email}</td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-white/10 px-2 py-1 rounded">
                        {formatWalletAddress(investor.walletAddress)}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-secondary">{investor.country}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-sm">
                        {getInvestorInvestmentCount(investor._id)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      ${getInvestorTotalInvestment(investor._id).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-secondary text-sm">
                      {formatDate(investor.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Investments Tab */}
      {activeTab === 'investments' && (
        <Card variant="frosted" className="p-6">
          <h2 className="section-header">All Investments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Investor</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Project Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold">{investment.user.firstName} {investment.user.lastName}</div>
                        <div className="text-sm text-secondary">{investment.user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold">{investment.project.projectName}</div>
                        <div className="text-sm text-secondary">{investment.project.location}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      ${investment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        investment.project.status === 'OPERATIONAL' 
                          ? 'bg-green-500/20 text-green-300'
                          : investment.project.status === 'SEEKING_FUNDING'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-300/20 text-secondary'
                      }`}>
                        {investment.project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary text-sm">
                      {formatDate(investment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
} 