'use client';

import { useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { PortfolioCard } from '@/components/PortfolioCard';
import { Card } from '@/components/ui/Card';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

export default function PortfolioPage() {
  const { isConnected, account, userPositions, projects, refreshUserPositions, refreshProjects } = useWeb3();

  useEffect(() => {
    console.log('📊 Portfolio useEffect triggered:', { isConnected, account, projectsCount: projects.length });
    if (isConnected && account) {
      // Refresh data when component mounts
      console.log('🔄 Triggering portfolio data refresh...');
      refreshProjects();
      refreshUserPositions();
    }
  }, [isConnected, account]); // Removed function refs - they're useCallback so stable

  if (!isConnected) {
    return (
      <main className="container-main">
        <h1 className="section-header">My Portfolio</h1>
        <Card variant="frosted" className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-secondary mb-6">
            Connect your wallet to view your NFT position tokens and claimable rewards.
          </p>
          <div className="max-w-sm mx-auto">
            <ConnectWalletButton />
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="container-main">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-header">My Portfolio</h1>
        <div className="text-right">
          <p className="text-sm text-secondary">Connected Wallet</p>
          <p className="font-mono text-sm">{account?.slice(0,6)}...{account?.slice(-4)}</p>
        </div>
      </div>

      {/* Portfolio Summary */}
      {userPositions.length > 0 && (
        <Card variant="frosted" className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-secondary">Total Positions</p>
              <p className="text-2xl font-bold">{userPositions.length}</p>
            </div>
            <div>
              <p className="text-sm text-secondary">Total Invested</p>
              <p className="text-2xl font-bold">
                {userPositions.reduce((sum, pos) => sum + parseFloat(pos.funded), 0).toFixed(4)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary">Total Rewards</p>
              <p className="text-2xl font-bold text-green-400">
                {userPositions.reduce((sum, pos) => sum + parseFloat(pos.pendingRewards), 0).toFixed(4)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary">Projects</p>
              <p className="text-2xl font-bold">
                {new Set(userPositions.map(pos => pos.projectId)).size}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Debug Info */}
      <Card variant="frosted" className="p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">🔍 Debug Portfolio Data</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Connected Account:</strong> {account}</p>
          <p><strong>Is Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User Positions Found:</strong> {userPositions.length}</p>
          <p><strong>Projects Available:</strong> {projects.length}</p>
          {userPositions.length > 0 && (
            <div>
              <strong>Positions:</strong>
              <pre className="text-xs mt-2 p-2 bg-black/20 rounded">
                {JSON.stringify(userPositions, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <button 
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            refreshProjects();
            refreshUserPositions();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          🔄 Manual Refresh
        </button>
      </Card>

      {/* Individual Positions */}
      <div className="space-y-6">
        {userPositions.length > 0 ? userPositions.map(position => (
          <PortfolioCard 
            key={`${position.projectAddress}-${position.tokenId}`} 
            position={position} 
          />
        )) : (
          <Card variant="frosted" className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">No Positions Found</h2>
            <p className="text-secondary mb-4">
              You haven't invested in any projects yet.
            </p>
            <p className="text-sm text-secondary">
              Browse available projects and make your first investment to get started!
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}