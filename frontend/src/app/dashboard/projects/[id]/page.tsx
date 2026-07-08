'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '@/config/server';
import axios from 'axios';
import { ethers } from 'ethers';
import Link from 'next/link';
import Image from 'next/image';

import { useWeb3 } from '@/context/Web3Context';
import toast from 'react-hot-toast';

import { StyledInput } from '@/components/StyledInput';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProjectStatusInfo } from '@/components/ProjectStatusInfo'; // Import the new component
import { PerformanceChart } from '@/components/PerformanceChart'; // Import the new chart component
import { CheckCircleIcon, ClockIcon, ArrowPathIcon, LinkIcon, CircleStackIcon, HashtagIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
  // Blockchain integration fields
  blockchainProjectId?: number;
  blockchainAddress?: string;
  deployedOnChain?: boolean;
  machineModel?: string;
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
  const [investmentAmount, setInvestmentAmount] = useState('0.0001'); // Changed to RBTC
  const [percentage, setPercentage] = useState(0);
  const [isInvesting, setIsInvesting] = useState(false);
  const [onChainData, setOnChainData] = useState<any>(null);
  const [loadingOnChain, setLoadingOnChain] = useState(false);
  
  // Use Web3 context
  const { isConnected, account, fundProject, connectWallet, provider, factoryContract } = useWeb3();

  // Fetch specific on-chain data for this project
  const fetchOnChainData = useCallback(async () => {
    if (!project?.blockchainProjectId || !provider || !factoryContract || !isConnected) {
      console.log('❌ Missing requirements for blockchain fetch:', {
        blockchainProjectId: project?.blockchainProjectId,
        hasProvider: !!provider,
        hasFactoryContract: !!factoryContract,
        isConnected
      });
      return;
    }

    setLoadingOnChain(true);
    try {
      console.log('🔍 Fetching on-chain data for project #', project.blockchainProjectId);
      console.log('🏭 Factory contract address:', factoryContract.target || factoryContract.address);
      
      // Get project record from factory (basic info)
      console.log('📞 Calling factoryContract.getProject...');
      const projectRecord = await factoryContract.getProject(project.blockchainProjectId);
      console.log('📋 Project record from factory:', projectRecord);
      
      // Get project address
      const projectAddress = projectRecord.projectAddress;
      console.log('🏠 Project contract address:', projectAddress);
      
      // Create contract instance for the specific project to get funding info
      console.log('📦 Loading UnitProjectERC721 ABI...');
      const UnitProjectERC721ABI = (await import('@/contracts/UnitProjectERC721.json')).default;
      const projectContract = new ethers.Contract(projectAddress, UnitProjectERC721ABI, provider);
      
      // Get funding information from the project contract
      console.log('💰 Calling projectContract.totalFunded...');
      const totalFunded = await projectContract.totalFunded();
      console.log('💰 Raw totalFunded from contract:', totalFunded.toString());
      
      const fundingProgress = totalFunded > 0 ? (Number(totalFunded) / Number(projectRecord.fundingCap)) * 100 : 0;
      
      const chainData = {
        projectId: project.blockchainProjectId,
        projectAddress,
        name: projectRecord.name,
        location: projectRecord.location,
        model: projectRecord.model,
        fundingCap: ethers.formatEther(projectRecord.fundingCap),
        totalFunded: ethers.formatEther(totalFunded),
        beneficiary: projectRecord.escrowBeneficiary,
        state: Number(projectRecord.state), // 0=SEEKING_FUNDING, 1=FUNDED, 2=OPERATIONAL, 3=CLOSED
        fundingProgress
      };
      
      console.log('✅ On-chain data fetched successfully:', chainData);
      setOnChainData(chainData);
    } catch (error: any) {
      console.error('❌ Failed to fetch on-chain data:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        data: error?.data
      });
    } finally {
      setLoadingOnChain(false);
    }
  }, [project?.blockchainProjectId, provider, factoryContract, isConnected]);

  // Debug logging for project structure
  useEffect(() => {
    if (project) {
      console.log('🔍 Project Data Structure:', {
        databaseId: id,
        databaseProject: {
          name: project.name || project.projectName,
          blockchainProjectId: project.blockchainProjectId,
          blockchainAddress: project.blockchainAddress,
          deployedOnChain: project.deployedOnChain,
          status: project.status,
          fundingGoal: project.fundingGoal || project.goalAmount,
        },
        calculatedFunding: {
          goal: goal,
          current: current,
          progress: fundingProgress.toFixed(1) + '%',
          dataSource: onChainData ? 'blockchain' : 'database',
          usingLiveData: !!onChainData,
        },
        readyToInvest: project.deployedOnChain && project.status === 'SEEKING_FUNDING',
        onChainDataLoaded: !!onChainData,
      });
    }
  }, [project, onChainData, id]);
  
  const connectedAccount = isConnected ? account : null;

  useEffect(() => {
    if (id) {
      // Fetch off-chain project data from backend
              axios.get(`${API_URL}/projects/${id}`)
        .then(response => setProject(response.data))
        .catch(error => console.error('Failed to fetch project details:', error));

      // This is now handled by PerformanceChart component
      /*
              axios.get(`${API_URL}/performance/${id}`)
        .then(response => setPerformanceData(response.data))
        .catch(error => console.error('Failed to fetch performance data:', error));
      */
    }
  }, [id]);

  // Fetch on-chain data when project and wallet are ready
  useEffect(() => {
    if (project?.deployedOnChain && project?.blockchainProjectId && isConnected && factoryContract) {
      console.log('🔄 Auto-fetching on-chain data for connected wallet');
      console.log('📋 Fetch conditions:', {
        deployedOnChain: project.deployedOnChain,
        blockchainProjectId: project.blockchainProjectId,
        isConnected,
        hasFactoryContract: !!factoryContract,
        hasProvider: !!provider
      });
      fetchOnChainData();
    } else {
      console.log('⏸️ Not auto-fetching blockchain data:', {
        deployedOnChain: project?.deployedOnChain,
        blockchainProjectId: project?.blockchainProjectId,
        isConnected,
        hasFactoryContract: !!factoryContract,
        hasProvider: !!provider
      });
    }
  }, [project?.deployedOnChain, project?.blockchainProjectId, isConnected, fetchOnChainData, factoryContract, provider]);

  // Safely access properties for backward compatibility
  const name = project?.name ?? project?.projectName ?? 'Untitled Project';
  const mainImage = project?.mainImage ?? project?.imageUrl ?? '';
  const images = project?.images ?? project?.imageUrls ?? [];
  
  // Use blockchain data when available, fallback to database
  const goal = onChainData ? parseFloat(onChainData.fundingCap) : (project?.fundingGoal ?? project?.goalAmount ?? 0);
  const current = onChainData ? parseFloat(onChainData.totalFunded) : (project?.currentFunding ?? 0);
  const fundingProgress = onChainData ? onChainData.fundingProgress : (goal > 0 ? (current / goal) * 100 : 0);
  const projectState = project?.deployedOnChain ? (onChainData?.state ?? 0) : undefined; // 0 = SEEKING_FUNDING

  useEffect(() => {
    if (goal > 0) {
      const amount = parseFloat(investmentAmount);
      if (!isNaN(amount) && amount >= 0) {
        setPercentage((amount / goal) * 100);
      } else {
        setPercentage(0);
      }
    }
  }, [investmentAmount, goal]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseFloat(e.target.value);
    setPercentage(newPercentage);
    if (goal > 0) {
      const newAmount = (newPercentage / 100) * goal;
      setInvestmentAmount(newAmount.toFixed(4)); // 4 decimal places for RBTC
    }
  };

  const handleInvestment = async () => {
    console.log('🔍 Investment Validation Debug:', {
      connectedAccount,
      investmentAmount,
      id,
      onChainData,
      projectState,
      hasOnChainData: !!onChainData,
      isConnected,
      account
    });

    // More specific validation messages
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!investmentAmount || parseFloat(investmentAmount) < 0.0001) {
      toast.error('Please enter a valid investment amount. Minimum: 0.0001 RBTC');
      return;
    }

    if (!id) {
      toast.error('Project ID not found');
      return;
    }

    // Check basic project requirements
    if (!project?.deployedOnChain) {
      toast.error('This project is not deployed on blockchain yet');
      return;
    }

    if (!project?.blockchainProjectId) {
      toast.error('Project blockchain linking is missing. Please contact admin.');
      return;
    }

    // Check project status - use blockchain data if available, otherwise database status
    const isSeekingFunding = onChainData 
      ? (onChainData.state === 0) // 0 = SEEKING_FUNDING on blockchain
      : (project.status === 'SEEKING_FUNDING'); // Database status as fallback

    if (!isSeekingFunding) {
      toast.error('This project is not currently seeking funding');
      return;
    }

    setIsInvesting(true);
    const loadingToast = toast.loading('Sending investment transaction...');
    
    try {
      await fundProject(project.blockchainProjectId, investmentAmount);
      toast.dismiss(loadingToast);
      toast.success('Investment successful! You received an NFT position token.');
    } catch (error: any) {
      console.error('Investment failed:', error);
      toast.dismiss(loadingToast);
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('CAP')) {
        toast.error('Investment would exceed funding cap');
      } else {
        toast.error('Investment transaction failed');
      }
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
        <div className="relative w-full h-60 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <div className="relative w-full h-full">
            <Image src={images[0]} alt={`${name} image 1`} fill className="object-cover" />
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {images.length} images
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-full h-60 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Image src={mainImage} alt={name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04070e]/85 via-[#04070e]/25 to-transparent"></div>
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
        <Badge 
          variant={projectState === 2 ? 'success' : projectState === 1 ? 'warning' : 'pending'} 
          size="md"
        >
          {projectState === 0 ? 'SEEKING FUNDING' : 
           projectState === 1 ? 'FUNDED' : 
           projectState === 2 ? 'OPERATIONAL' : 
           projectState === 3 ? 'CLOSED' : 
           formatStatus(project.status)}
        </Badge>
      </div>

             {/* Blockchain linking status */}
       {project && (
         <Card variant="frosted" className="p-4 mb-6">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="mono-label">Blockchain integration</h3>
               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs">
                 <span className={`inline-flex items-center gap-1.5 ${project.deployedOnChain ? 'text-success' : 'text-text-muted'}`}>
                   {project.deployedOnChain ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <ClockIcon className="h-3.5 w-3.5" />}
                   {project.deployedOnChain ? 'Deployed' : 'Not deployed'}
                 </span>
                 {project.blockchainProjectId && (
                   <span className="inline-flex items-center gap-1.5 text-brand-primary">
                     <HashtagIcon className="h-3.5 w-3.5" /> ID #{project.blockchainProjectId}
                   </span>
                 )}
                 {project.blockchainAddress && project.blockchainAddress !== 'TBD' && (
                   <span className="inline-flex items-center gap-1.5 text-brand-secondary">
                     <MapPinIcon className="h-3.5 w-3.5" /> {project.blockchainAddress.slice(0, 8)}…
                   </span>
                 )}
                 {onChainData && (
                   <span className="inline-flex items-center gap-1.5 text-success">
                     <LinkIcon className="h-3.5 w-3.5" /> Live data loaded
                   </span>
                 )}
                 {!onChainData && project.deployedOnChain && isConnected && (
                   <span className="inline-flex items-center gap-1.5 text-warning">
                     <CircleStackIcon className="h-3.5 w-3.5" /> Using database data
                   </span>
                 )}
               </div>
             </div>
             <Button
               onClick={fetchOnChainData}
               variant="outline"
               size="sm"
               disabled={loadingOnChain || !isConnected}
             >
               <ArrowPathIcon className={`h-4 w-4 ${loadingOnChain ? 'animate-spin' : ''}`} />
               {loadingOnChain ? 'Loading' : 'Get Live Data'}
             </Button>
           </div>
         </Card>
       )}

      {/* Project funding info */}
      {project && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card variant="frosted" className="p-4 text-center">
            <p className="mono-label mb-1">Funding {onChainData ? 'Cap' : 'Goal'}</p>
            <p className="text-lg font-bold tabular-nums">{goal.toFixed(2)} ETH</p>
            <p className="mono-label mt-1 !tracking-[0.08em]">{onChainData ? 'On-chain' : 'Database'}</p>
          </Card>
          <Card variant="frosted" className="p-4 text-center">
            <p className="mono-label mb-1">Total Funded</p>
            <p className="text-lg font-bold tabular-nums">{current.toFixed(2)} ETH</p>
            <p className="mono-label mt-1 !tracking-[0.08em]">{onChainData ? 'Live' : 'Database'}</p>
          </Card>
          <Card variant="frosted" className="p-4 text-center">
            <p className="mono-label mb-1">Progress</p>
            <p className="text-lg font-bold tabular-nums">{fundingProgress.toFixed(1)}%</p>
            <p className="mono-label mt-1 !tracking-[0.08em]">{onChainData ? 'Live' : 'Calculated'}</p>
          </Card>
          <Card variant="frosted" className="p-4 text-center">
            <p className="mono-label mb-1">Blockchain ID</p>
            <p className="text-lg font-bold tabular-nums">#{project.blockchainProjectId || 'TBD'}</p>
            <p className="mono-label mt-1 !tracking-[0.08em]">Database</p>
          </Card>
        </div>
      )}

      {/* --- New Project Status Info Component --- */}
      <ProjectStatusInfo status={project.status} />

      {project?.deployedOnChain && project?.status === 'SEEKING_FUNDING' && (
        <Card variant="frosted" className="p-6 my-8">
          <h2 className="section-header">Invest in this Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <label htmlFor="investment" className="block text-sm font-medium mb-1">Investment Amount (RBTC)</label>
                <StyledInput 
                  id="investment" 
                  type="number" 
                  step="0.0001"
                  min="0.0001"
                  value={investmentAmount} 
                  onChange={(e) => setInvestmentAmount(e.target.value)} 
                  placeholder="e.g., 0.0001"
                />
                <p className="text-xs text-secondary mt-1">
                  Min: 0.0001 RBTC • Max: {goal > 0 ? (goal - current).toFixed(4) : '∞'} RBTC
                </p>
              </div>
              <div>
                <label htmlFor="percentage" className="block text-sm font-medium mb-1">
                  Funding Percentage ({percentage > 100 ? 100 : percentage.toFixed(3)}%)
                </label>
                <input
                  id="percentage"
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentage}
                  onChange={handleSliderChange}
                  className="w-full slider cursor-pointer"
                />
              </div>

              {!connectedAccount ? (
                <Button onClick={connectWallet} variant="accent" size="lg" className="w-full">
                  Connect Wallet to Invest
                </Button>
              ) : (
                <>
                  <Card variant="default" className="text-center p-3 bg-success/20 border border-success">
                    <p className="text-sm">Wallet Connected</p>
                    <p className="text-xs font-mono">{connectedAccount?.slice(0,6)}...{connectedAccount?.slice(-4)}</p>
                  </Card>
                  <Button
                    onClick={handleInvestment}
                    disabled={!investmentAmount || isInvesting || parseFloat(investmentAmount) < 0.0001}
                    variant="accent"
                    size="lg"
                    className="w-full"
                  >
                    {isInvesting ? 'Processing...' : `Invest ${investmentAmount} RBTC`}
                  </Button>
                </>
              )}
            </div>
            
            <Card variant="default" className="bg-surface-muted p-6 flex flex-col items-center justify-center text-center">
                <p className="text-secondary">Funding Progress</p>
                <p className="text-4xl font-bold my-2">
                  {current.toFixed(3)} ETH / <span className="text-2xl text-secondary">{goal.toFixed(3)} ETH</span>
                </p>
                <ProgressBar value={fundingProgress} className="mb-2" />
                <p className="text-sm text-secondary">
                  {(goal - current).toFixed(3)} ETH remaining
                </p>
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