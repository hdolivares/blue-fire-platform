'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Import contract ABIs
import BlueFireFactoryABI from '@/contracts/BlueFireFactory.json';
import UnitProjectERC721ABI from '@/contracts/UnitProjectERC721.json';
import contractAddresses from '@/contracts/contract-address.json';

// Types
export interface ProjectInfo {
  projectId: number;
  projectAddress: string;
  name: string;
  fundingCap: string;
  totalFunded: string;
  state: number; // 0=SEEKING_FUNDING, 1=FUNDED, 2=OPERATIONAL, 3=CLOSED
  beneficiary: string;
  alice: string;
  fundingProgress: number;
}

export interface UserPosition {
  tokenId: number;
  projectId: number;
  projectAddress: string;
  funded: string;
  pendingRewards: string;
}

export interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  
  // Contracts
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  factoryContract: ethers.Contract | null;
  
  // Data
  projects: ProjectInfo[];
  userPositions: UserPosition[];
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToAnvilNetwork: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshUserPositions: () => Promise<void>;
  
  // Contract interactions
  getProjectContract: (projectAddress: string) => ethers.Contract | null;
  fundProject: (projectId: number, amount: string) => Promise<any>;
  claimRewards: (projectAddress: string, tokenId: number) => Promise<any>;
  depositRevenue: (projectAddress: string, amount: string) => Promise<any>;
  
  // Admin functions
  createProject: (name: string, location: string, model: string, fundingCap: string, beneficiary: string) => Promise<any>;
  setAlice: (projectId: number, aliceAddress: string) => Promise<any>;
  approveEscrowRelease: (projectId: number) => Promise<any>;
  releaseEscrow: (projectId: number) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Default configuration
const DEFAULT_CONFIG = {
  factoryAddress: contractAddresses.BlueFireFactory,
  supportedChainId: 31337, // Anvil localhost (preferred)
  acceptedLocalChainIds: [31337, 1337, 42], // Accept common localhost chain IDs
  rpcUrl: 'http://localhost:8545',
};

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Ethers instances
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [factoryContract, setFactoryContract] = useState<ethers.Contract | null>(null);
  
  // Data state
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);

  // Initialize provider on mount
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  // Refresh data when account changes
  useEffect(() => {
    if (isConnected && account) {
      refreshProjects();
      refreshUserPositions();
    }
  }, [isConnected, account]);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        
        if (accounts.length > 0) {
          await setupConnection(browserProvider);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setChainId(newChainId);
    
    if (!DEFAULT_CONFIG.acceptedLocalChainIds.includes(newChainId)) {
      toast.error(`Wrong network! Please switch to a localhost network (supported: ${DEFAULT_CONFIG.acceptedLocalChainIds.join(', ')})`);
    } else if (newChainId !== DEFAULT_CONFIG.supportedChainId) {
      toast.success(`Connected to localhost chain ${newChainId} (works but ${DEFAULT_CONFIG.supportedChainId} is preferred)`);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const setupConnection = async (browserProvider: ethers.BrowserProvider) => {
    try {
      const network = await browserProvider.getNetwork();
      const currentSigner = await browserProvider.getSigner();
      const currentAccount = await currentSigner.getAddress();
      
      const currentChainId = Number(network.chainId);
      const isAcceptedNetwork = DEFAULT_CONFIG.acceptedLocalChainIds.includes(currentChainId);
      const isPreferredNetwork = currentChainId === DEFAULT_CONFIG.supportedChainId;
      
      console.log('🔍 Network Detection Debug:', {
        detectedChainId: currentChainId,
        preferredChainId: DEFAULT_CONFIG.supportedChainId,
        acceptedChainIds: DEFAULT_CONFIG.acceptedLocalChainIds,
        networkName: network.name,
        isAcceptedNetwork,
        isPreferredNetwork
      });
      
      // Check if we're on an accepted network
      if (!isAcceptedNetwork) {
        toast.error(`Wrong network detected! Current: ${currentChainId}. Please switch to a localhost network (${DEFAULT_CONFIG.acceptedLocalChainIds.join(', ')})`);
        setChainId(currentChainId); // Still set the chain ID for debugging
        return; // Don't proceed with unsupported network
      }
      
      // Warn if not on preferred network but continue
      if (!isPreferredNetwork) {
        toast.success(`Connected to localhost chain ${currentChainId} (works, but chain ${DEFAULT_CONFIG.supportedChainId} is preferred for Anvil)`);
      }
      
      // Setup factory contract
      const factory = new ethers.Contract(
        DEFAULT_CONFIG.factoryAddress,
        BlueFireFactoryABI,
        currentSigner
      );
      
      setProvider(browserProvider);
      setSigner(currentSigner);
      setFactoryContract(factory);
      setAccount(currentAccount);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      console.log('✅ Web3 connection established:', {
        account: currentAccount,
        chainId: Number(network.chainId),
        factory: DEFAULT_CONFIG.factoryAddress,
      });
      
    } catch (error) {
      console.error('Failed to setup connection:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask is not installed');
      return;
    }

    try {
      // First try to add/switch to Anvil network
      await addAnvilNetwork();
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await setupConnection(browserProvider);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const addAnvilNetwork = async () => {
    try {
      // Try to switch to Anvil network first (31337)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      });
      console.log('✅ Switched to existing Anvil network (31337)');
    } catch (switchError: any) {
      console.log('Switch error:', switchError);
      
      // If network doesn't exist (4902), try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69', // 31337 in hex
              chainName: 'Anvil Local (31337)',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://localhost:8545'],
              blockExplorerUrls: null,
            }],
          });
          console.log('✅ Added new Anvil network (31337)');
        } catch (addError: any) {
          console.error('Failed to add Anvil network:', addError);
          
          // If network with same RPC exists (-32603), try switching to localhost networks
          if (addError.code === -32603) {
            console.log('🔄 Network with same RPC exists, trying to switch to existing localhost networks...');
            await tryExistingLocalhostNetworks();
          } else {
            throw addError;
          }
        }
      } else {
        throw switchError;
      }
    }
  };

  const tryExistingLocalhostNetworks = async () => {
    const commonLocalhostChainIds = [
      '0x7a69', // 31337 (Anvil default)
      '0x539',  // 1337 (Common localhost)
      '0x2a',   // 42 (Legacy testnet)
    ];

    for (const chainId of commonLocalhostChainIds) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        console.log(`✅ Switched to existing localhost network: ${chainId} (${parseInt(chainId, 16)})`);
        
        // Show info about network mismatch
        const chainIdDecimal = parseInt(chainId, 16);
        if (chainIdDecimal !== 31337) {
          toast.error(`Using chain ${chainIdDecimal} instead of 31337. You may need to restart Anvil with --chain-id 31337`);
        }
        return;
      } catch (error) {
        console.log(`Failed to switch to ${chainId}:`, error);
        continue;
      }
    }
    
    throw new Error('No localhost networks available. Please add Anvil network manually.');
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setFactoryContract(null);
    setProjects([]);
    setUserPositions([]);
    
    console.log('🔌 Wallet disconnected');
    toast.success('Wallet disconnected');
  };

  const refreshProjects = useCallback(async () => {
    if (!factoryContract) return;

    try {
      const nextProjectId = await factoryContract.nextProjectId();
      const projectCount = Number(nextProjectId) - 1; // nextProjectId starts at 1
      
      // If no projects exist yet, set empty array
      if (projectCount <= 0) {
        setProjects([]);
        return;
      }

      const projectPromises = [];
      for (let i = 1; i <= projectCount; i++) { // Project IDs start at 1
        projectPromises.push(getProjectInfo(i));
      }

      const projectInfos = await Promise.allSettled(projectPromises);
      const validProjects = projectInfos
        .filter((result): result is PromiseFulfilledResult<ProjectInfo> => result.status === 'fulfilled')
        .map(result => result.value);

      setProjects(validProjects);
    } catch (error) {
      console.error('Failed to refresh projects:', error);
    }
  }, [factoryContract]);

  const getProjectInfo = async (projectId: number): Promise<ProjectInfo> => {
    if (!factoryContract) throw new Error('Factory contract not available');

    const projectAddress = await factoryContract.getProjectAddress(projectId);
    const projectContract = new ethers.Contract(projectAddress, UnitProjectERC721ABI, provider);

    const [name, fundingCap, totalFunded, state, beneficiary, alice] = await Promise.all([
      projectContract.name(),
      projectContract.fundingCap(),
      projectContract.totalFunded(),
      projectContract.state(),
      projectContract.escrowBeneficiary(),
      projectContract.alice(),
    ]);

    const fundingCapNum = parseFloat(ethers.formatEther(fundingCap));
    const totalFundedNum = parseFloat(ethers.formatEther(totalFunded));

    return {
      projectId,
      projectAddress,
      name,
      fundingCap: ethers.formatEther(fundingCap),
      totalFunded: ethers.formatEther(totalFunded),
      state: Number(state),
      beneficiary,
      alice,
      fundingProgress: fundingCapNum > 0 ? (totalFundedNum / fundingCapNum) * 100 : 0,
    };
  };

  const refreshUserPositions = useCallback(async () => {
    if (!account || projects.length === 0) return;

    try {
      const positionPromises = projects.map(async (project) => {
        const projectContract = new ethers.Contract(project.projectAddress, UnitProjectERC721ABI, provider);
        
        try {
          const balance = await projectContract.balanceOf(account);
          const positions: UserPosition[] = [];

          for (let i = 0; i < Number(balance); i++) {
            const tokenId = await projectContract.tokenOfOwnerByIndex(account, i);
            const funded = await projectContract.funded(tokenId);
            const pendingRewards = await projectContract.pendingRewards(tokenId);

            positions.push({
              tokenId: Number(tokenId),
              projectId: project.projectId,
              projectAddress: project.projectAddress,
              funded: ethers.formatEther(funded),
              pendingRewards: ethers.formatEther(pendingRewards),
            });
          }

          return positions;
        } catch (error) {
          console.error(`Failed to get positions for project ${project.projectId}:`, error);
          return [];
        }
      });

      const allPositions = await Promise.all(positionPromises);
      const flatPositions = allPositions.flat();
      setUserPositions(flatPositions);
    } catch (error) {
      console.error('Failed to refresh user positions:', error);
    }
  }, [account, projects, provider]);

  const getProjectContract = (projectAddress: string): ethers.Contract | null => {
    if (!signer) return null;
    return new ethers.Contract(projectAddress, UnitProjectERC721ABI, signer);
  };

  // Contract interactions
  const fundProject = async (projectId: number, amount: string) => {
    if (!factoryContract) throw new Error('Factory contract not available');

    const projectAddress = await factoryContract.getProjectAddress(projectId);
    const projectContract = getProjectContract(projectAddress);
    if (!projectContract) throw new Error('Project contract not available');

    const tx = await projectContract.fundProject({ value: ethers.parseEther(amount) });
    await tx.wait();
    
    // Refresh data after successful transaction
    await refreshProjects();
    await refreshUserPositions();
    
    return tx;
  };

  const claimRewards = async (projectAddress: string, tokenId: number) => {
    const projectContract = getProjectContract(projectAddress);
    if (!projectContract) throw new Error('Project contract not available');

    const tx = await projectContract.claim(tokenId);
    await tx.wait();
    
    // Refresh positions after claiming
    await refreshUserPositions();
    
    return tx;
  };

  const depositRevenue = async (projectAddress: string, amount: string) => {
    const projectContract = getProjectContract(projectAddress);
    if (!projectContract) throw new Error('Project contract not available');

    const tx = await projectContract.payWaterRevenue({ value: ethers.parseEther(amount) });
    await tx.wait();
    
    // Refresh data after revenue deposit
    await refreshProjects();
    await refreshUserPositions();
    
    return tx;
  };

  // Admin functions
  const createProject = async (name: string, location: string, model: string, fundingCap: string, beneficiary: string) => {
    if (!factoryContract) throw new Error('Factory contract not available');

    const tx = await factoryContract.createProject(
      name,
      location,
      model,
      ethers.parseEther(fundingCap),
      beneficiary
    );
    await tx.wait();
    
    // Refresh projects after creation
    await refreshProjects();
    
    return tx;
  };

  const setAlice = async (projectId: number, aliceAddress: string) => {
    if (!factoryContract) throw new Error('Factory contract not available');

    const tx = await factoryContract.setAlice(projectId, aliceAddress);
    await tx.wait();
    
    return tx;
  };

  const approveEscrowRelease = async (projectId: number) => {
    if (!factoryContract) throw new Error('Factory contract not available');

    const tx = await factoryContract.approveEscrowRelease(projectId);
    await tx.wait();
    
    return tx;
  };

  const releaseEscrow = async (projectId: number) => {
    if (!factoryContract) throw new Error('Factory contract not available');

    const tx = await factoryContract.releaseEscrow(projectId);
    await tx.wait();
    
    // Refresh projects after escrow release
    await refreshProjects();
    
    return tx;
  };

  const contextValue: Web3ContextType = {
    // Connection state
    isConnected,
    account,
    chainId,
    
    // Contracts
    provider,
    signer,
    factoryContract,
    
    // Data
    projects,
    userPositions,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToAnvilNetwork: addAnvilNetwork,
    refreshProjects,
    refreshUserPositions,
    
    // Contract interactions
    getProjectContract,
    fundProject,
    claimRewards,
    depositRevenue,
    
    // Admin functions
    createProject,
    setAlice,
    approveEscrowRelease,
    releaseEscrow,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 