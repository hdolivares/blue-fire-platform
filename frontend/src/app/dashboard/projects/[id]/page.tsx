'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 

import { ethers } from 'ethers';
import stakingVaultAbi from '@/contracts/StakingVault.json';
import contractAddress from '@/contracts/contract-address.json';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { StyledInput } from '@/components/StyledInput';
import { GlowingButton } from '@/components/GlowingButton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProjectStatusInfo } from '@/components/ProjectStatusInfo'; // Import the new component
import { PerformanceChart } from '@/components/PerformanceChart'; // Import the new chart component

// ChartJS registration is no longer needed here as it's handled in the component
/*
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
*/

// This should align with the backend enum
type ProjectStatus = 
  | 'SEEKING_FUNDING'
  | 'FUNDED_ORDER_PLACED'
  | 'FUNDED_MACHINE_SHIPPED'
  | 'FUNDED_INSTALLATION_PHASE'
  | 'OPERATIONAL';
  
// Updated interface for backward compatibility
interface Project {
  status: ProjectStatus;
  // New schema fields
  name?: string;
  goalAmount?: number;
  currentAmount?: number;
  mainImage?: string;
  images?: string[];
  // Legacy fields
  projectName?: string;
  fundingGoal?: number;
  currentFunding?: number;
  imageUrl?: string;
  imageUrls?: string[];
  // Other fields that might exist
  avgHumidity?: number;
  avgTemperature?: number;
}
/*
interface PerformanceData {
  _id: string;
  date: string;
  waterProduction: number;
}
*/
const formatStatus = (status: string = '') => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function ProjectDetailPage() {
  const params = useParams();
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  // The new component handles its own data fetching
  // const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState('1000');
  const [percentage, setPercentage] = useState(0);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3001/projects/${id}`)
        .then(response => setProject(response.data))
        .catch(error => console.error('Failed to fetch project details:', error));

      // This is now handled by PerformanceChart component
      /*
      axios.get(`http://localhost:3001/performance/${id}`)
        .then(response => setPerformanceData(response.data))
        .catch(error => console.error('Failed to fetch performance data:', error));
      */
    }
  }, [id]);

  // Safely access properties for backward compatibility
  const name = project?.name ?? project?.projectName ?? 'Untitled Project';
  const goal = project?.goalAmount ?? project?.fundingGoal ?? 0;
  const current = project?.currentAmount ?? project?.currentFunding ?? 0;
  const mainImage = project?.mainImage ?? project?.imageUrl ?? '';
  const images = project?.images ?? project?.imageUrls ?? [];

  useEffect(() => {
    if (project && goal > 0) {
      const amount = parseFloat(investmentAmount);
      if (!isNaN(amount) && amount >= 0) {
        setPercentage((amount / goal) * 100);
      } else {
        setPercentage(0);
      }
    }
  }, [investmentAmount, project, goal]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseFloat(e.target.value);
    setPercentage(newPercentage);
    if (project) {
      const newAmount = (newPercentage / 100) * goal;
      setInvestmentAmount(newAmount.toFixed(0));
    }
  };
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setConnectedAccount(address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert('Please install a browser wallet like MetaMask.');
    }
  };

  const handleInvestment = async () => {
    if (!connectedAccount || !investmentAmount || !id) return;
    setIsInvesting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.StakingVault, stakingVaultAbi, signer);
      const priceInCrypto = Number(investmentAmount) * 0.0005;
      const amountToSend = ethers.parseEther(priceInCrypto.toString());
      const tx = await contract.stake(id.toString(), { value: amountToSend });
      alert('Transaction sent! Waiting for confirmation...');
      await tx.wait();
      alert('Investment successful!');
    } catch (error) {
      console.error('Investment failed:', error);
      alert('Investment transaction failed.');
    } finally {
      setIsInvesting(false);
    }
  };

  if (!project) {
    return <div className="text-center p-10">Loading...</div>;
  }
  
  // All chart logic is now in the PerformanceChart component
  /*
  const chartOptions = {
    scales: {
      y: { ticks: { color: '#E5E7EB' }, grid: { color: 'rgba(229, 231, 235, 0.1)' }},
      x: { ticks: { color: '#E5E7EB' }, grid: { color: 'rgba(229, 231, 235, 0.1)' }},
    },
    plugins: { legend: { labels: { color: '#E5E7EB' }}}
  };
  
  const chartData = {
    labels: performanceData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Water Production (Liters)',
        data: performanceData.map(d => d.waterProduction),
        borderColor: '#89f7fe',
        backgroundColor: 'rgba(137, 247, 254, 0.2)',
        fill: true,
      },
    ],
  };
  */

  // const avgWaterProduction = performanceData.reduce((acc, item) => acc + item.waterProduction, 0) / performanceData.length;
  const fundingPercentage = goal > 0 ? (current / goal) * 100 : 0;

  return (
    <main className="container-main">
      {images.length > 0 ? (
        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Carousel showThumbs={false} autoPlay infiniteLoop showStatus={false}>
            {images.map((url, index) => (
              <div key={index} className="relative w-full h-96">
                <Image src={url} alt={`${name} image ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="relative w-full h-60 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Image src={mainImage} alt={name} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => window.location.href = '/dashboard'}
        className="mb-6"
      >
        &larr; Back to Dashboard
      </Button>

      <h1 className="section-header">{name}</h1>
      
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-lg text-secondary">Status:</span>
        <Badge variant={project.status === 'OPERATIONAL' ? 'success' : 'pending'} size="md">{formatStatus(project.status)}</Badge>
      </div>

      {/* --- New Project Status Info Component --- */}
      <ProjectStatusInfo status={project.status} />

      {project.status === 'SEEKING_FUNDING' && (
        <Card variant="frosted" className="p-6 my-8">
          <h2 className="section-header">Invest in this Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <label htmlFor="investment" className="block text-sm font-medium mb-1">Investment Amount (USD)</label>
                <StyledInput id="investment" type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} placeholder="e.g., 1000"/>
              </div>
              <div>
                <label htmlFor="percentage" className="block text-sm font-medium mb-1">Ownership Percentage ({percentage > 100 ? 100 : percentage.toFixed(2)}%)</label>
                <input id="percentage" type="range" min="0" max="100" value={percentage} onChange={handleSliderChange} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"/>
              </div>
              
              {!connectedAccount ? (
                <GlowingButton onClick={connectWallet}>
                  Connect Wallet to Invest
                </GlowingButton>
              ) : (
                <>
                  <Card variant="default" className="text-center p-3 bg-green-500/20 border border-green-500">
                    <p className="text-sm">Wallet Connected</p>
                  </Card>
                  <Button onClick={handleInvestment} disabled={!investmentAmount || isInvesting} variant="primary" size="lg" className="w-full">
                    {isInvesting ? 'Processing...' : 'Invest Now'}
                  </Button>
                </>
              )}
            </div>
            
            <Card variant="default" className="bg-sky-500/20 p-6 flex flex-col items-center justify-center text-center">
                <p className="text-secondary">Funding Progress</p>
                <p className="text-4xl font-bold my-2">${current.toLocaleString()} / <span className="text-2xl text-secondary">${goal.toLocaleString()}</span></p>
                <div className="w-full bg-white/10 rounded-full h-4">
                  <div className="bg-gradient-accent h-4 rounded-full" style={{ width: `${fundingPercentage}%` }}></div>
                </div>
            </Card>
          </div>
        </Card>
      )}

      {/* --- Performance Section with stats and the new chart --- */}
      {project.status === 'OPERATIONAL' && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <Card variant="frosted" className="p-6">
              <h3 className="text-secondary text-sm">Average Humidity</h3>
              <p className="text-3xl font-bold">{project.avgHumidity || 'N/A'}%</p>
            </Card>
            <Card variant="frosted" className="p-6">
              <h3 className="text-secondary text-sm">Average Temperature</h3>
              <p className="text-3xl font-bold">{project.avgTemperature || 'N/A'} °C</p>
            </Card>
            <Card variant="frosted" className="p-6">
              <h3 className="text-secondary text-sm">Est. Daily Production</h3>
              <p className="text-3xl font-bold">~1750 L</p>
            </Card>
          </div>
          
          {id && <PerformanceChart projectId={id as string} />}
        </div>
      )}

    </main>
  );
}