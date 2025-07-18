'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface BlockchainMetrics {
  totalValueLocked: number;
  totalTransactions: number;
  activeInvestors: number;
  averageInvestment: number;
  platformRevenue: number;
  gasUsed: number;
  blockNumber: number;
}

interface BlockchainStatus {
  isConnected: boolean;
  networkId: number;
  latestBlock: number;
  gasPrice: string;
  peers: number;
}

const BlockchainMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<BlockchainMetrics | null>(null);
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsResponse, statusResponse] = await Promise.all([
          axios.get('/admin/analytics/blockchain-metrics'),
          axios.get('/admin/analytics/blockchain-status')
        ]);
        setMetrics(metricsResponse.data);
        setStatus(statusResponse.data);
      } catch (err) {
        setError('Failed to load blockchain data');
        console.error('Error fetching blockchain data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!metrics || !status) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(1);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Blockchain Metrics</h2>
        <p className="text-blue-100">Real-time RSK blockchain data and platform metrics</p>
      </div>

      {/* Blockchain Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-gray-600">Connection</p>
              <p className="font-semibold text-gray-900">{status.isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Network ID</p>
            <p className="font-semibold text-gray-900">{status.networkId}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Latest Block</p>
            <p className="font-semibold text-gray-900">{formatNumber(status.latestBlock)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Gas Price</p>
            <p className="font-semibold text-gray-900">{status.gasPrice} Gwei</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value Locked</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalValueLocked)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalTransactions)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Investors</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeInvestors}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.platformRevenue)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold text-gray-900">{formatNumber(metrics.totalTransactions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gas Used</span>
              <span className="font-semibold text-gray-900">{formatNumber(metrics.gasUsed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Block Number</span>
              <span className="font-semibold text-gray-900">{formatNumber(metrics.blockNumber)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Network Peers</span>
              <span className="font-semibold text-gray-900">{status.peers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Investors</span>
              <span className="font-semibold text-gray-900">{metrics.activeInvestors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Investment</span>
              <span className="font-semibold text-gray-900">{formatCurrency(metrics.averageInvestment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Value Locked</span>
              <span className="font-semibold text-gray-900">{formatCurrency(metrics.totalValueLocked)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform Revenue</span>
              <span className="font-semibold text-gray-900">{formatCurrency(metrics.platformRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Health */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {status.isConnected ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-600">Connection Status</div>
            <div className="text-xs text-green-600 mt-1">
              {status.isConnected ? 'Connected to RSK' : 'Disconnected'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {status.peers}
            </div>
            <div className="text-sm text-gray-600">Network Peers</div>
            <div className="text-xs text-blue-600 mt-1">Active Connections</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {status.gasPrice}
            </div>
            <div className="text-sm text-gray-600">Gas Price (Gwei)</div>
            <div className="text-xs text-purple-600 mt-1">Current Network Fee</div>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Updates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Blockchain data updates every 30 seconds</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Network status monitored continuously</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Transaction count updated in real-time</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Gas prices tracked from RSK network</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">TVL calculated from smart contracts</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Investor activity monitored live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainMetrics; 