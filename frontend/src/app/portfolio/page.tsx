'use client';

import { useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { PortfolioCard } from '@/components/PortfolioCard';
import { Card } from '@/components/ui/Card';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

export default function PortfolioPage() {
  const { isConnected, account, userPositions, refreshUserPositions, refreshProjects } = useWeb3();

  useEffect(() => {
    if (isConnected && account) {
      // Refresh data when component mounts
      refreshProjects();
      refreshUserPositions();
    }
  }, [isConnected, account]);

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