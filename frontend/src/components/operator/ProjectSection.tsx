'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useWeb3 } from '@/context/Web3Context';
import { GlowingButton } from '@/components/GlowingButton';
import { BookingCalendar } from '@/components/BookingCalendar';
import { StyledInput } from '@/components/StyledInput';
import { AssignedProject } from '@/types/project';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState('1.0'); // ETH amount

  // Web3 context
  const { isConnected, account, projects, depositRevenue, connectWallet } = useWeb3();
  const connectedAccount = isConnected ? account : null;

  // Find on-chain project data
  const onChainProject = projects.find(p => p.projectId.toString() === project._id);

  // --- CONSTANTS FOR CALCULATION ---
  const PRICE_PER_LITER_USD = 0.10;
  const ETH_USD_RATE = 2000; // Approximate ETH price - in production, get from API
  const MIN_DAYS = 7;
  const MAX_DAYS = 45;

  // --- DERIVED CALCULATIONS ---
  // These calculations are based on the project data and the slider value.
  const dailyUsdCost = project.avgDailyWaterProduction * PRICE_PER_LITER_USD;
  const totalUsdCost = dailyUsdCost * daysToPurchase;
  const totalEthCost = totalUsdCost / ETH_USD_RATE;
  
  /**
   * @function handleRevenueDeposit
   * @description Handles depositing revenue to the project contract.
   */
  const handleRevenueDeposit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!onChainProject) {
      toast.error('Project not found on-chain');
      return;
    }

    if (!revenueAmount || parseFloat(revenueAmount) <= 0) {
      toast.error('Please enter a valid revenue amount');
      return;
    }

    if (onChainProject.state !== 2) { // 2 = OPERATIONAL
      toast.error('Project must be operational to deposit revenue');
      return;
    }
    
    setIsProcessing(true);
    const loadingToast = toast.loading('Depositing revenue...');
    
    try {
      await depositRevenue(onChainProject.projectAddress, revenueAmount);
      toast.dismiss(loadingToast);
      toast.success(`Successfully deposited ${revenueAmount} ETH as revenue!`);
      setRevenueAmount('1.0'); // Reset form
    } catch (error: any) {
      console.error('Revenue deposit failed:', error);
      toast.dismiss(loadingToast);
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('NOT_ALICE')) {
        toast.error('Only assigned operator can deposit revenue');
      } else if (error.message?.includes('NOT_OPERATIONAL')) {
        toast.error('Project must be operational to deposit revenue');
      } else {
        toast.error('Failed to deposit revenue');
      }
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
          <form onSubmit={handleRevenueDeposit} className="space-y-6 flex flex-col flex-grow">
            <div className="space-y-4">
              <div>
                <label htmlFor="revenueAmount" className="block text-sm font-medium mb-1">
                  Revenue Amount (ETH)
                </label>
                <input
                  id="revenueAmount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0"
                />
                <p className="text-xs text-secondary mt-1">
                  Revenue from water sales to distribute to investors
                </p>
              </div>
              
              <Slider
                min={MIN_DAYS}
                max={MAX_DAYS}
                value={daysToPurchase}
                onChange={setDaysToPurchase}
                label="Production Period (Info):"
                showValue={true}
              />
            </div>
            
            <Card variant="default" className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 text-center border border-green-500/20">
              <p className="text-secondary text-sm mb-2">Revenue Deposit</p>
              <p className="text-4xl font-bold text-white mb-1">{parseFloat(revenueAmount || '0').toFixed(4)} ETH</p>
              <p className="text-lg text-secondary">Water Sales Revenue</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm text-secondary">≈ ${(parseFloat(revenueAmount || '0') * ETH_USD_RATE).toFixed(2)} USD</p>
              </div>
            </Card>
            
            {onChainProject && (
              <Card variant="default" className="bg-blue-500/10 p-4 border border-blue-500/20">
                <p className="text-xs text-secondary mb-2">Project Status</p>
                <p className="text-sm font-medium">
                  State: {onChainProject.state === 0 ? 'SEEKING_FUNDING' : 
                          onChainProject.state === 1 ? 'FUNDED' : 
                          onChainProject.state === 2 ? 'OPERATIONAL' : 'CLOSED'}
                </p>
                <p className="text-xs text-secondary">
                  Only OPERATIONAL projects can receive revenue deposits
                </p>
              </Card>
            )}
            
            <div className="mt-auto pt-6">
              {!connectedAccount ? (
                <div className="w-full">
                  <GlowingButton onClick={connectWallet}>
                    Connect Wallet to Deposit Revenue
                  </GlowingButton>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isProcessing || !onChainProject || onChainProject.state !== 2} 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : `Deposit ${revenueAmount} ETH Revenue`}
                </Button>
              )}
            </div>
          </form>
        )}
      </Card>

      {/* Column 3: Calendar */}
      <div className="lg:col-span-1">
        <BookingCalendar 
          soldUntilDate={project.waterSoldUntil ? new Date(project.waterSoldUntil) : undefined} 
          daysToPurchase={daysToPurchase}
          avgDailyWaterProduction={project.avgDailyWaterProduction}
        />
      </div>
    </div>
  );
}