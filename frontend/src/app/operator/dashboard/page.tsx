'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ethers } from 'ethers';
import unitControllerAbi from '@/contracts/UnitController.json';
import { StyledInput } from '@/components/StyledInput';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { GlowingButton } from '@/components/GlowingButton';

// Defines the shape of the project data expected by this component
interface AssignedProject {
  _id: string;
  projectName: string;
  location: string;
  status: string;
  unitControllerAddress: string;
  imageUrl: string;
  avgHumidity: number;
  avgTemperature: number;
  avgDailyWaterProduction: number;
}

// Helper function to format the status text
const formatStatus = (status: string = '') => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function OperatorDashboardPage() {
  // --- STATE MANAGEMENT ---
  const { token } = useAuth(); // The JWT for making authenticated API calls
  const [project, setProject] = useState<AssignedProject | null>(null); // Stores the operator's assigned project
  const [loading, setLoading] = useState(true); // Manages the initial loading state of the page
  const [amount, setAmount] = useState(''); // Manages the value of the deposit amount input field
  const [isProcessing, setIsProcessing] = useState(false); // Manages the loading state of the deposit button
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null); // To track wallet connection

  /**
   * @function useEffect
   * @description Fetches the project assigned to the currently logged-in operator
   * using the secure backend endpoint when the component mounts or the token changes.
   */
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3001/operators/my-project', {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token for authentication
        },
      })
      .then(response => {
        setProject(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch assigned project:', error);
        toast.error("Could not load your assigned project.");
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [token]);
  
  /**
   * @function connectWallet
   * @description Connects to the user's browser wallet and sets the account state.
   */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setConnectedAccount(address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setConnectedAccount(null);
      }
    } else {
      toast.error('Please install a browser wallet like MetaMask.');
    }
  };

  /**
   * @function handlePurchaseWater
   * @description Handles the form submission to deposit revenue.
   * It constructs and sends a transaction to the UnitController smart contract.
   */
  const handlePurchaseWater = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project || !project.unitControllerAddress || !amount) {
      return toast.error("Project not loaded or amount is missing.");
    }
    if (!window.ethereum) {
      return toast.error("Please install a browser wallet like MetaMask.");
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Sending transaction...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        project.unitControllerAddress,
        unitControllerAbi,
        signer
      );
      const amountToSend = ethers.parseEther(amount);
      const tx = await contract.depositRevenue({ value: amountToSend });
      toast.loading('Waiting for confirmation...', { id: loadingToast });
      await tx.wait();
      toast.dismiss(loadingToast);
      toast.success('Deposit successful!');
      setAmount('');

    } catch (error) {
      console.error('Purchase failed:', error);
      toast.dismiss(loadingToast);
      toast.error('Transaction failed or was rejected.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading Your Project...</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Operator Dashboard</h1>
      {project ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 card-frosted p-0 flex flex-col overflow-hidden">
            <div className="relative w-full h-40">
              <Image src={project.imageUrl} alt={project.projectName} fill className="object-cover" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h2 className="text-2xl font-bold">{project.projectName}</h2>
              <p className="text-gray-100 text-sm mb-4">{project.location}</p>
              <p className="text-lg text-green-400 font-semibold">{formatStatus(project.status)}</p>
              
              <div className="mt-auto space-y-3 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-100">Avg. Daily Production</span>
                  <span className="font-bold text-lg">{project.avgDailyWaterProduction} L</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-100">Avg. Humidity</span>
                  <span className="font-bold text-lg">{project.avgHumidity}%</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-100">Avg. Temperature</span>
                  <span className="font-bold text-lg">{project.avgTemperature}°C</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 card-frosted p-6">
            <h2 className="text-2xl font-bold mb-4">Purchase Water</h2>
            <p className="text-gray-100 mb-6">Deposit revenue into the system to reconcile your water sales.</p>
            
            <form onSubmit={handlePurchaseWater} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (in RBTC)</label>
                <StyledInput id="amount" type="number" step="0.001" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>

              {!connectedAccount ? (
                <div className="pt-2">
                  <GlowingButton onClick={connectWallet}>
                    Connect Wallet to Continue
                  </GlowingButton>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-2 transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Submit Deposit'}
                </button>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="card-frosted p-8 text-center">
          <h2 className="text-2xl font-bold">No Project Assigned</h2>
          <p className="mt-2 text-gray-300">Please contact an administrator to be assigned to an operational unit.</p>
        </div>
      )}
    </main>
  );
}