'use client';

import { useState } from 'react';
import { useWeb3, UserPosition } from '@/context/Web3Context';
import toast from 'react-hot-toast';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface PortfolioCardProps {
  position: UserPosition;
  projectName?: string;
}

export const PortfolioCard = ({ position, projectName }: PortfolioCardProps) => {
  const { claimRewards, projects } = useWeb3();
  const [isClaiming, setIsClaiming] = useState(false);

  // Find project info from Web3 context
  const onChainProject = projects.find(p => p.projectId === position.projectId);
  const displayName = onChainProject?.name || projectName || `Project #${position.projectId}`;

  const handleClaim = async () => {
    if (parseFloat(position.pendingRewards) <= 0) {
      toast.error('No rewards available to claim');
      return;
    }

    setIsClaiming(true);
    const loadingToast = toast.loading('Claiming rewards...');
    
    try {
      await claimRewards(position.projectAddress, position.tokenId);
      toast.dismiss(loadingToast);
      toast.success(`Successfully claimed ${parseFloat(position.pendingRewards).toFixed(4)} ETH!`);
    } catch (error: any) {
      console.error("Claim failed:", error);
      toast.dismiss(loadingToast);
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('NO_REWARDS')) {
        toast.error('No rewards available to claim');
      } else {
        toast.error('Failed to claim rewards');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const hasClaimable = parseFloat(position.pendingRewards) > 0;
  const fundingSharePercentage = onChainProject 
    ? (parseFloat(position.funded) / parseFloat(onChainProject.fundingCap)) * 100 
    : 0;

  return (
    <Card variant="frosted" className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <p className="text-sm text-secondary">NFT Position Token #{position.tokenId}</p>
          {onChainProject && (
            <p className="text-xs text-secondary">
              State: {onChainProject.state === 0 ? 'SEEKING_FUNDING' : 
                      onChainProject.state === 1 ? 'FUNDED' : 
                      onChainProject.state === 2 ? 'OPERATIONAL' : 'CLOSED'}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-secondary">Project #{position.projectId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
        <div>
          <p className="text-sm text-secondary">Your Investment</p>
          <p className="text-xl font-bold">{parseFloat(position.funded).toFixed(4)} ETH</p>
        </div>
        <div>
          <p className="text-sm text-secondary">Your Share</p>
          <p className="text-xl font-bold">{fundingSharePercentage.toFixed(3)}%</p>
        </div>
        <div>
          <p className="text-sm text-secondary">Pending Rewards</p>
          <p className={`text-xl font-bold ${hasClaimable ? 'text-green-400' : 'text-secondary'}`}>
            {parseFloat(position.pendingRewards).toFixed(4)} ETH
          </p>
        </div>
        <div className="flex items-center">
          <Button 
            onClick={handleClaim}
            disabled={!hasClaimable || isClaiming}
            variant={hasClaimable ? "primary" : "secondary"}
            size="sm"
            className="w-full"
          >
            {isClaiming ? 'Claiming...' : hasClaimable ? 'Claim Rewards' : 'No Rewards'}
          </Button>
        </div>
      </div>
      
      {onChainProject && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-secondary">Total Funded</p>
              <p className="font-bold">{parseFloat(onChainProject.totalFunded).toFixed(3)} ETH</p>
            </div>
            <div>
              <p className="text-secondary">Funding Cap</p>
              <p className="font-bold">{parseFloat(onChainProject.fundingCap).toFixed(3)} ETH</p>
            </div>
            <div>
              <p className="text-secondary">Progress</p>
              <p className="font-bold">{onChainProject.fundingProgress.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};