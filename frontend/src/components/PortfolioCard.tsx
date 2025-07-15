// In frontend/src/components/PortfolioCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import stakingVaultAbi from '@/contracts/StakingVault.json';
import contractAddress from '@/contracts/contract-address.json';

export const PortfolioCard = ({ investment }: { investment: any }) => {
  const { token } = useAuth();
  const [claimable, setClaimable] = useState("0.00");
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (token && investment.project) {
      axios.get(`http://localhost:3001/investments/${investment.project._id}/claimable`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => setClaimable(response.data));
    }
  }, [token, investment]);

  const handleClaim = async () => {
    setIsClaiming(true);
    const loadingToast = toast.loading('Sending claim transaction...');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.StakingVault, stakingVaultAbi, signer);

      const tx = await contract.claimRewards(investment.project._id);
      toast.loading('Waiting for confirmation...', { id: loadingToast });
      await tx.wait();

      toast.dismiss(loadingToast);
      toast.success('Rewards claimed successfully!');
      setClaimable("0.00"); // Reset UI after successful claim
    } catch (error) {
      console.error("Claim failed:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to claim rewards.");
    } finally {
      setIsClaiming(false);
    }
  };

  const hasClaimable = parseFloat(claimable) > 0;

  return (
    <div className="card-frosted p-6">
      <h2 className="text-2xl font-bold">{investment.project.projectName}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
        <div>
          <p className="text-sm text-gray-300">Your Investment</p>
          <p className="text-xl font-bold">${investment.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">Your Share</p>
          <p className="text-xl font-bold">{((investment.amount / investment.project.fundingGoal) * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">Claimable Rewards</p>
          <p className="text-xl font-bold text-green-400">{parseFloat(claimable).toFixed(4)} RBTC</p>
        </div>
        <div className="flex items-center">
          <button 
            onClick={handleClaim}
            disabled={!hasClaimable || isClaiming}
            className="w-full py-2 px-4 rounded-md bg-gradient-accent text-white font-bold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
      </div>
    </div>
  );
};