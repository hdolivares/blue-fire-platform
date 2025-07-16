'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import Image from 'next/image';

import unitControllerAbi from '@/contracts/UnitController.json';
import { GlowingButton } from '@/components/GlowingButton';
import { BookingCalendar } from '@/components/BookingCalendar';
import { StyledInput } from '@/components/StyledInput';
import { AssignedProject } from '@/types/project';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/**
 * @function formatStatus
 * @description A helper function to make status strings look nicer (e.g., 'OPERATIONAL' -> 'Operational').
 */
const formatStatus = (status: string = '') => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * @component ProjectSection
 * @description This component displays all information and actions for a single project assigned to an Operator.
 */
export const ProjectSection = ({ project }: { project: AssignedProject }) => {
  // --- STATE MANAGEMENT for this specific project section ---
  const [daysToPurchase, setDaysToPurchase] = useState(7); 
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- CONSTANTS FOR CALCULATION ---
  const PRICE_PER_LITER_USD = 0.10;
  const USD_TO_RBTC_RATE = 0.000035;

  // --- DERIVED CALCULATIONS ---
  // These calculations are based on the project data and the slider value.
  const dailyUsdCost = project.avgDailyWaterProduction * PRICE_PER_LITER_USD;
  const totalUsdCost = dailyUsdCost * daysToPurchase;
  const totalRbtcCost = totalUsdCost * USD_TO_RBTC_RATE;
  
  /**
   * @function connectWallet
   * @description Connects to the user's browser wallet and updates the state.
   */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setConnectedAccount(await signer.getAddress());
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast.error("Failed to connect wallet.");
      }
    } else {
      toast.error('Please install a browser wallet like MetaMask.');
    }
  };

  /**
   * @function handlePurchaseWater
   * @description Handles the final submission, sending the calculated RBTC amount to the smart contract.
   */
  const handlePurchaseWater = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project.unitControllerAddress || totalRbtcCost <= 0) {
      return toast.error("Project not loaded or amount is invalid.");
    }
    
    setIsProcessing(true);
    const loadingToast = toast.loading('Sending transaction...');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(project.unitControllerAddress, unitControllerAbi, signer);
      const amountToSend = ethers.parseEther(totalRbtcCost.toFixed(18));
      const tx = await contract.depositRevenue({ value: amountToSend });
      
      toast.loading('Waiting for confirmation...', { id: loadingToast });
      await tx.wait();
      
      toast.dismiss(loadingToast);
      toast.success('Deposit successful!');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.dismiss(loadingToast);
      toast.error('Transaction failed or was rejected.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isSoldOut = project.waterSoldUntil && new Date(project.waterSoldUntil) > new Date();
  const nextAvailableDate = project.waterSoldUntil ? new Date(project.waterSoldUntil).toLocaleDateString() : 'N/A';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
      {/* Column 1: Project Info */}
      <Card variant="frosted" className="lg:col-span-1 p-0 flex flex-col overflow-hidden h-full">
        <div className="relative w-full h-48">
          <Image src={project.imageUrl} alt={project.projectName} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h2 className="text-2xl font-bold mb-2">{project.projectName}</h2>
          <p className="text-secondary text-sm mb-4">{project.location}</p>
          <div className="mt-auto space-y-4 pt-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-secondary">Avg. Daily Production</span>
              <span className="font-bold text-lg text-green-400">{project.avgDailyWaterProduction} L</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-secondary">Avg. Humidity</span>
              <span className="font-bold text-lg text-blue-400">{project.avgHumidity}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-secondary">Avg. Temperature</span>
              <span className="font-bold text-lg text-orange-400">{project.avgTemperature}°C</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Column 2: Purchase Card */}
      <Card variant="frosted" className="lg:col-span-1 p-6 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Purchase Water Production</h2>
        {isSoldOut ? (
          <Card variant="default" className="text-center bg-yellow-500/10 border border-yellow-500/50 p-6 my-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-300">Production Booked</h3>
              <p className="mt-2 text-secondary">This unit's water production has been purchased until {nextAvailableDate}.</p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handlePurchaseWater} className="space-y-6 flex flex-col flex-grow">
            <div className="space-y-4">
              <div>
                <label htmlFor="days" className="block text-sm font-medium mb-3">
                  Days to Purchase: <span className="font-bold text-white text-lg">{daysToPurchase}</span>
                </label>
                <input 
                  id="days" 
                  type="range" 
                  min="7" 
                  max="45" 
                  value={daysToPurchase} 
                  onChange={(e) => setDaysToPurchase(Number(e.target.value))} 
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-secondary mt-1">
                  <span>7 days</span>
                  <span>45 days</span>
                </div>
              </div>
            </div>
            
            <Card variant="default" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 text-center border border-blue-500/20">
              <p className="text-secondary text-sm mb-2">Total Estimated Cost</p>
              <p className="text-4xl font-bold text-white mb-1">${totalUsdCost.toFixed(2)}</p>
              <p className="text-lg text-secondary">USD</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm text-secondary">≈ {totalRbtcCost.toFixed(6)} RBTC</p>
              </div>
            </Card>
            
            <div className="mt-auto pt-6">
              {!connectedAccount ? (
                <div className="w-full">
                  <GlowingButton onClick={connectWallet}>
                    Connect Wallet to Purchase
                  </GlowingButton>
                </div>
              ) : (
                <Button type="submit" disabled={isProcessing} variant="primary" size="lg" className="w-full">
                  {isProcessing ? 'Processing...' : `Purchase ${daysToPurchase} Days`}
                </Button>
              )}
            </div>
          </form>
        )}
      </Card>

      {/* Column 3: Calendar */}
      <div className="lg:col-span-1">
        <BookingCalendar soldUntilDate={project.waterSoldUntil ? new Date(project.waterSoldUntil) : undefined} daysToPurchase={daysToPurchase} />
      </div>
    </div>
  );
}