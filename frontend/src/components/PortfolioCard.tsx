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
  const [showClaimPreview, setShowClaimPreview] = useState(false);
  const [lastClaimAmount, setLastClaimAmount] = useState<string | null>(null);

  // Find project info from Web3 context
  const onChainProject = projects.find(p => p.projectId === position.projectId);
  const displayName = onChainProject?.name || projectName || `Project #${position.projectId}`;

  /**
   * @function validateClaim
   * @description Validates claim requirements before showing preview
   */
  const validateClaim = (): boolean => {
    if (parseFloat(position.pendingRewards) <= 0) {
      toast.error('No rewards available to claim');
      return false;
    }

    if (parseFloat(position.pendingRewards) < 0.0001) {
      toast.error('Reward amount too small to claim (minimum 0.0001 RBTC)');
      return false;
    }

    if (!onChainProject) {
      toast.error('Project data not loaded. Please refresh the page.');
      return false;
    }

    return true;
  };

  /**
   * @function handleClaimPreview
   * @description Shows claim preview before confirmation
   */
  const handleClaimPreview = () => {
    const isValid = validateClaim();
    if (!isValid) return;

    setShowClaimPreview(true);
  };

  /**
   * @function confirmClaim
   * @description Executes the actual claim after confirmation
   */
  const confirmClaim = async () => {
    setIsClaiming(true);
    setShowClaimPreview(false);
    const claimAmount = parseFloat(position.pendingRewards);
    const loadingToast = toast.loading('Claiming rewards from smart contract...');
    
    try {
      await claimRewards(position.projectAddress, position.tokenId);
      toast.dismiss(loadingToast);
      
      // Store last claim amount for display
      setLastClaimAmount(claimAmount.toFixed(4));
      
      toast.success(`Successfully claimed ${claimAmount.toFixed(4)} RBTC!`);
      
      // Show additional success info
      setTimeout(() => {
        toast.success('Rewards have been transferred to your wallet!', {
          duration: 3000,
        });
      }, 1000);
      
    } catch (error: any) {
      console.error("Claim failed:", error);
      toast.dismiss(loadingToast);
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('NO_REWARDS')) {
        toast.error('No rewards available to claim');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient ETH for transaction fees');
      } else if (error.message?.includes('execution reverted')) {
        toast.error('Claim transaction failed. Please try again.');
      } else {
        toast.error(`Claim failed: ${error.message || 'Unknown error'}`);
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
          <p className={`text-xl font-bold ${hasClaimable ? 'text-success' : 'text-secondary'}`}>
            {parseFloat(position.pendingRewards).toFixed(4)} ETH
          </p>
        </div>
        <div className="flex items-center">
          <Button 
            onClick={handleClaimPreview}
            disabled={!hasClaimable || isClaiming}
            variant={hasClaimable ? "primary" : "secondary"}
            size="sm"
            className="w-full"
          >
            {isClaiming ? 'Claiming...' : hasClaimable ? 'Preview Claim' : 'No Rewards'}
          </Button>
        </div>
      </div>
      
      {onChainProject && (
        <div className="mt-4 pt-4 border-t border-border">
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

      {/* Last Claim Info */}
      {lastClaimAmount && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary">Last Claim</span>
            <span className="text-xs font-medium text-success">+{lastClaimAmount} RBTC</span>
          </div>
        </div>
      )}

      {/* Claim Preview Modal */}
      {showClaimPreview && onChainProject && (
        <div className="fixed inset-0 bg-surface-muted flex items-center justify-center z-50 p-4">
          <Card variant="frosted" className="max-w-md w-full p-6 shadow-xl border-border bg-surface backdrop-blur-md">
            <h3 className="display-caps text-xl mb-4 text-text-primary">Claim rewards preview</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
                <span className="text-text-secondary">Project</span>
                <span className="font-medium text-text-primary">{displayName}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
                <span className="text-text-secondary">Your NFT Token</span>
                <span className="font-medium text-text-primary">#{position.tokenId}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[var(--success-bg)] border border-success/20 rounded-lg">
                <span className="text-text-secondary">Claimable Rewards</span>
                <span className="font-bold text-success text-lg">{parseFloat(position.pendingRewards).toFixed(4)} ETH</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
                <span className="text-text-secondary">USD Value</span>
                <span className="font-medium text-text-primary">≈ ${(parseFloat(position.pendingRewards) * 2000).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
                <span className="text-text-secondary">Your Investment</span>
                <span className="font-medium text-text-primary">{parseFloat(position.funded).toFixed(4)} ETH</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
                <span className="text-text-secondary">Your Share</span>
                <span className="font-medium text-text-primary">{fundingSharePercentage.toFixed(3)}%</span>
              </div>
            </div>

            <div className="bg-[var(--success-bg)] border border-success/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium mb-2 text-text-primary">What happens next:</h4>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Rewards will be transferred to your wallet</li>
                <li>• Transaction will be recorded on blockchain</li>
                <li>• Your pending rewards will reset to 0</li>
                <li>• Future revenue deposits will accumulate new rewards</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowClaimPreview(false)}
                variant="outline" 
                size="lg"
                className="flex-1"
                disabled={isClaiming}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmClaim}
                variant="primary" 
                size="lg"
                className="flex-1"
                disabled={isClaiming}
              >
                {isClaiming ? 'Processing...' : `Claim ${parseFloat(position.pendingRewards).toFixed(4)} ETH`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};