'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useWeb3 } from '@/context/Web3Context';
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
  const [revenueAmount, setRevenueAmount] = useState('0.0001'); // RBTC amount
  const [showRevenuePreview, setShowRevenuePreview] = useState(false);
  const [validatingProject, setValidatingProject] = useState(false);

  // Web3 context
  const { isConnected, account, projects, depositRevenue, connectWallet } = useWeb3();
  const connectedAccount = isConnected ? account : null;

  // Find on-chain project data using blockchainProjectId
  const onChainProject = project.blockchainProjectId 
    ? projects.find(p => p.projectId === project.blockchainProjectId)
    : null;

  // --- CONSTANTS FOR CALCULATION ---
  const PRICE_PER_LITER_USD = 0.10;
  const ETH_USD_RATE = 100000; // Approximate ETH price - in production, get from API
  const MIN_DAYS = 7;
  const MAX_DAYS = 45;

  // --- DERIVED CALCULATIONS ---
  // These calculations are based on the project data and the slider value.
  const dailyUsdCost = project.avgDailyWaterProduction * PRICE_PER_LITER_USD;
  const totalUsdCost = dailyUsdCost * daysToPurchase;
  const totalEthCost = totalUsdCost / ETH_USD_RATE;
  
  /**
   * @function validateRevenueDeposit
   * @description Validates revenue deposit requirements and shows preview
   */
  const validateRevenueDeposit = async () => {
    if (!connectedAccount) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!project.deployedOnChain) {
      toast.error('This project is not deployed on blockchain yet');
      return false;
    }

    if (!onChainProject) {
      toast.error('Loading project data from blockchain...');
      return false;
    }

    if (!revenueAmount || parseFloat(revenueAmount) <= 0) {
      toast.error('Please enter a valid revenue amount greater than 0');
      return false;
    }

    if (parseFloat(revenueAmount) > 100) {
      toast.error('Revenue amount seems unusually high. Please verify.');
      return false;
    }

    // Check if user is the assigned operator (Alice)
    if (onChainProject.alice && onChainProject.alice.toLowerCase() !== connectedAccount.toLowerCase()) {
      toast.error('Only the assigned operator can deposit revenue');
      return false;
    }

    if (onChainProject.state !== 2) { // 2 = OPERATIONAL
      const stateNames = ['SEEKING_FUNDING', 'FUNDED', 'OPERATIONAL', 'CLOSED'];
      toast.error(`Project must be operational to deposit revenue. Current state: ${stateNames[onChainProject.state] || 'Unknown'}`);
      return false;
    }

    return true;
  };

  /**
   * @function handleRevenuePreview
   * @description Shows preview before confirming revenue deposit
   */
  const handleRevenuePreview = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const isValid = await validateRevenueDeposit();
    if (!isValid) return;

    setShowRevenuePreview(true);
  };

  /**
   * @function confirmRevenueDeposit
   * @description Executes the actual revenue deposit after confirmation
   */
  const confirmRevenueDeposit = async () => {
    if (!onChainProject) return;
    
    setIsProcessing(true);
    setShowRevenuePreview(false);
    const loadingToast = toast.loading('Depositing revenue to smart contract...');
    
    try {
      await depositRevenue(onChainProject.projectAddress, revenueAmount);
      toast.dismiss(loadingToast);
      toast.success(`Successfully deposited ${revenueAmount} RBTC as revenue!`);
      
      // Show distribution info
      setTimeout(() => {
        toast.success('Revenue will be automatically distributed to all investors!', {
          duration: 4000,
        });
      }, 1000);
      
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
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient ETH balance for this transaction');
      } else {
        toast.error(`Failed to deposit revenue: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isSoldOut = project.waterSoldUntil && new Date(project.waterSoldUntil) > new Date();
  const nextAvailableDate = project.waterSoldUntil ? new Date(project.waterSoldUntil).toLocaleDateString() : 'N/A';

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
      {/* Column 1: Project Info */}
      <Card variant="frosted" className="lg:col-span-1 p-0 flex flex-col overflow-hidden h-full">
        <div className="relative w-full h-48">
          <Image src={project.imageUrl} alt={project.projectName} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-muted to-transparent"></div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h2 className="text-2xl font-bold mb-2">{project.projectName}</h2>
          <p className="text-secondary text-sm mb-4">{project.location}</p>
          <div className="mt-auto space-y-4 pt-4">
            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Avg. Daily Production</span>
              <span className="font-bold text-lg text-success">{project.avgDailyWaterProduction} L</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Avg. Humidity</span>
              <span className="font-bold text-lg text-brand-primary">{project.avgHumidity}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Avg. Temperature</span>
              <span className="font-bold text-lg text-accent">{project.avgTemperature}°C</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Column 2: Purchase Card */}
      <Card variant="frosted" className="lg:col-span-1 p-6 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Purchase Water Production</h2>
        {isSoldOut ? (
          <Card variant="default" className="text-center bg-[var(--warning-bg)] border border-warning/50 p-6 my-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-warning">Production Booked</h3>
              <p className="mt-2 text-secondary">This unit's water production has been purchased until {nextAvailableDate}.</p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleRevenuePreview} className="space-y-6 flex flex-col flex-grow">
            <div className="space-y-4">
              <div>
                <label htmlFor="revenueAmount" className="block text-sm font-medium mb-1">
                  Revenue Amount (RBTC)
                </label>
                <input
                  id="revenueAmount"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  className="w-full p-3 rounded-lg bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
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
            
            <Card variant="default" className="bg-[var(--success-bg)] p-6 text-center border border-success/20">
              <p className="text-secondary text-sm mb-2">Revenue Deposit</p>
                              <p className="text-4xl font-bold text-text-primary mb-1">{parseFloat(revenueAmount || '0').toFixed(4)} RBTC</p>
              <p className="text-lg text-secondary">Water Sales Revenue</p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-secondary">≈ ${(parseFloat(revenueAmount || '0') * ETH_USD_RATE).toFixed(2)} USD</p>
              </div>
            </Card>
            
            {onChainProject && (
              <Card variant="default" className="bg-[var(--info-bg)] p-4 border border-brand-primary/20">
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
                  <Button onClick={connectWallet} variant="accent" size="lg" className="w-full">
                    Connect Wallet to Deposit Revenue
                  </Button>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isProcessing || !onChainProject || onChainProject.state !== 2 || validatingProject} 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 
                   validatingProject ? 'Validating...' : 
                   `Preview Revenue Deposit (${revenueAmount} RBTC)`}
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

    {/* Revenue Deposit Preview Modal */}
    {showRevenuePreview && onChainProject && (
      <div className="fixed inset-0 bg-surface-muted flex items-center justify-center z-50 p-4">
        <Card variant="frosted" className="max-w-md w-full p-6">
          <h3 className="display-caps text-xl mb-4">Revenue deposit preview</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Project</span>
              <span className="font-medium">{project.projectName}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Revenue Amount</span>
                              <span className="font-bold text-success">{revenueAmount} RBTC</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">USD Value</span>
              <span className="font-medium">≈ ${(parseFloat(revenueAmount) * ETH_USD_RATE).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Project State</span>
              <span className={`font-medium ${onChainProject?.state === 2 ? 'text-success' : 'text-danger'}`}>
                {onChainProject?.state === 2 ? 'Operational' : 'Not operational'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-surface-muted rounded-lg">
              <span className="text-secondary">Total Funded</span>
              <span className="font-medium">{onChainProject?.totalFunded} ETH</span>
            </div>
          </div>

          <div className="bg-[var(--info-bg)] border border-brand-primary/20 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium mb-2">What happens next:</h4>
            <ul className="text-xs text-secondary space-y-1">
              <li>• Revenue will be deposited to the smart contract</li>
              <li>• Investors can claim their share immediately</li>
              <li>• Transaction will be recorded on blockchain</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setShowRevenuePreview(false)}
              variant="outline" 
              size="lg"
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmRevenueDeposit}
              variant="primary" 
              size="lg"
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Deposit'}
            </Button>
          </div>
        </Card>
      </div>
    )}
  </>
  );
}