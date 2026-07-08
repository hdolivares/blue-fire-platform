'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { PortfolioCard } from '@/components/PortfolioCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { IconDrop } from '@/components/brand/assets';

export default function PortfolioPage() {
  const { isConnected, account, userPositions, projects, refreshUserPositions, refreshProjects } = useWeb3();

  useEffect(() => {
    if (isConnected && account) {
      refreshProjects();
      refreshUserPositions();
    }
  }, [isConnected, account]); // Removed function refs - they're useCallback so stable

  if (!isConnected) {
    return (
      <main className="container-main">
        <p className="kicker mb-2"><b>◇</b> Portfolio</p>
        <h1 className="section-header">My positions</h1>
        <Card variant="frosted" className="mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-muted text-brand-primary">
            <IconDrop className="h-7 w-7" />
          </div>
          <h2 className="display-caps text-xl mb-3">Connect your wallet</h2>
          <p className="text-text-secondary mb-6">
            Connect your wallet to view your NFT position tokens and claimable rewards.
          </p>
          <div className="max-w-sm mx-auto">
            <ConnectWalletButton />
          </div>
        </Card>
      </main>
    );
  }

  const totalInvested = userPositions.reduce((sum, pos) => sum + parseFloat(pos.funded), 0);
  const totalRewards = userPositions.reduce((sum, pos) => sum + parseFloat(pos.pendingRewards), 0);
  const projectCount = new Set(userPositions.map((pos) => pos.projectId)).size;

  const summary = [
    { label: 'Total positions', value: String(userPositions.length) },
    { label: 'Total invested', value: `${totalInvested.toFixed(4)} ETH` },
    { label: 'Total rewards', value: `${totalRewards.toFixed(4)} ETH`, tone: 'success' as const },
    { label: 'Projects', value: String(projectCount) },
  ];

  return (
    <main className="container-main">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <p className="kicker mb-2"><b>◇</b> Portfolio</p>
          <h1 className="section-header !mb-0">My positions</h1>
        </div>
        <div className="text-right">
          <p className="mono-label">Connected wallet</p>
          <p className="font-mono text-sm text-text-primary mt-1">{account?.slice(0, 6)}…{account?.slice(-4)}</p>
        </div>
      </div>

      {/* Portfolio Summary */}
      {userPositions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden mb-8">
          {summary.map((s) => (
            <div key={s.label} className="bg-surface p-5">
              <p className="mono-label mb-2">{s.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${s.tone === 'success' ? 'text-success' : 'text-text-primary'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Individual Positions */}
      <div className="space-y-6">
        {userPositions.length > 0 ? (
          userPositions.map((position) => (
            <PortfolioCard
              key={`${position.projectAddress}-${position.tokenId}`}
              position={position}
            />
          ))
        ) : (
          <EmptyState
            title="No positions yet"
            description="You haven't invested in any projects yet. Fund a machine to open your first on-chain position."
            icon={<IconDrop className="h-8 w-8" />}
            action={
              <Link href="/dashboard">
                <Button variant="primary">Browse projects</Button>
              </Link>
            }
          />
        )}
      </div>
    </main>
  );
}
