'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ethers } from 'ethers';
import unitControllerAbi from '@/contracts/UnitController.json';
import { StyledInput } from '@/components/StyledInput';

// Define the shape of the project data for this page
interface AssignedProject {
  _id: string;
  projectName: string;
  location: string;
  status: string;
  unitControllerAddress: string; // The specific contract address for this machine
}

export default function OperatorDashboardPage() {
  // Get the logged-in user's token from our AuthContext
  const { token } = useAuth();

  // State for the operator's project and the purchase form
  const [project, setProject] = useState<AssignedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Fetches the project assigned to the currently logged-in operator
   * using the secure backend endpoint.
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
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [token]);

  /**
   * Handles the form submission to purchase water.
   * This function constructs and sends a transaction to the UnitController smart contract.
   */
  const handlePurchaseWater = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project || !project.unitControllerAddress || !amount) {
      alert("Project not loaded or amount is missing.");
      return;
    }

    setIsProcessing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create an instance of the specific UnitController contract
      const contract = new ethers.Contract(
        project.unitControllerAddress,
        unitControllerAbi,
        signer
      );

      // Convert the amount to the smallest unit (e.g., wei)
      const amountToSend = ethers.parseEther(amount);

      // Send the transaction
      const tx = await contract.depositRevenue({ value: amountToSend });
      alert('Transaction sent! Waiting for confirmation...');
      await tx.wait();
      alert('Water purchase successful!');

    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Water purchase transaction failed.');
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
          {/* Project Info Column */}
          <div className="md:col-span-1 card-frosted p-6">
            <h2 className="text-2xl font-bold">{project.projectName}</h2>
            <p className="text-gray-300">{project.location}</p>
            <p className="text-lg text-green-400 font-semibold mt-2">{project.status}</p>
          </div>

          {/* Purchase Water Column */}
          <div className="md:col-span-2 card-frosted p-6">
            <h2 className="text-2xl font-bold mb-4">Purchase Water</h2>
            <p className="text-gray-400 mb-6">Deposit revenue into the system to reconcile your water sales.</p>
            <form onSubmit={handlePurchaseWater} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (in RBTC)</label>
                <StyledInput id="amount" type="number" step="0.001" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-2 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Submit Deposit'}
              </button>
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