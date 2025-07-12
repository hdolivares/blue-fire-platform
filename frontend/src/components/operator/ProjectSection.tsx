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
      <div className="lg:col-span-1 card-frosted p-0 flex flex-col overflow-hidden h-full">
        <div className="relative w-full h-40">
          <Image src={project.imageUrl} alt={project.projectName} fill className="object-cover" />
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h2 className="text-2xl font-bold">{project.projectName}</h2>
          <p className="text-gray-300 text-sm mb-4">{project.location}</p>
          <div className="mt-auto space-y-3 pt-4">
            <div className="flex justify-between items-baseline"><span className="text-gray-200">Avg. Daily Production</span><span className="font-bold text-lg">{project.avgDailyWaterProduction} L</span></div>
            <div className="flex justify-between items-baseline"><span className="text-gray-200">Avg. Humidity</span><span className="font-bold text-lg">{project.avgHumidity}%</span></div>
            <div className="flex justify-between items-baseline"><span className="text-gray-200">Avg. Temperature</span><span className="font-bold text-lg">{project.avgTemperature}°C</span></div>
          </div>
        </div>
      </div>

      {/* Column 2: Purchase Card */}
      <div className="lg:col-span-1 card-frosted p-6 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Purchase Water Production</h2>
        {isSoldOut ? (
          <div className="text-center bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 my-auto">
            <h3 className="text-xl font-bold text-yellow-300">Production Booked</h3>
            <p className="mt-2">This unit's water production has been purchased until {nextAvailableDate}.</p>
          </div>
        ) : (
          <form onSubmit={handlePurchaseWater} className="space-y-6 flex flex-col flex-grow">
            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-2">Days to Purchase: <span className="font-bold text-white text-lg">{daysToPurchase}</span></label>
              <input id="days" type="range" min="7" max="45" value={daysToPurchase} onChange={(e) => setDaysToPurchase(Number(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"/>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-white/80">Total Estimated Cost</p>
              <p className="text-3xl font-bold text-white my-1">${totalUsdCost.toFixed(2)} USD</p>
              <p className="text-lg text-white/80">&asymp; {totalRbtcCost.toFixed(6)} RBTC</p>
            </div>
            <div className="mt-auto pt-6">
              {!connectedAccount ? (
                <GlowingButton onClick={connectWallet}>Connect Wallet to Purchase</GlowingButton>
              ) : (
                <button type="submit" disabled={isProcessing} className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold transition-all hover:brightness-110 disabled:opacity-50">
                  {isProcessing ? 'Processing...' : `Purchase ${daysToPurchase} Days`}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Column 3: Calendar */}
      <div className="lg:col-span-1">
        <BookingCalendar soldUntilDate={project.waterSoldUntil ? new Date(project.waterSoldUntil) : undefined} daysToPurchase={daysToPurchase} />
      </div>
    </div>
  )
}