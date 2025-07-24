'use client';

import { useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { StyledInput } from '@/components/StyledInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const CreateProjectForm = () => {
  const { isConnected, account, createProject, refreshProjects, factoryContract } = useWeb3();
  const { user, token } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  
  // Form state - Enhanced for dual system
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    model: 'AquaGen-3000',
    fundingCap: '10.0', // ETH
    beneficiary: account || '',
    // Backend fields
    goalAmount: '10000', // USD equivalent for database (now editable)
    avgHumidity: '75', // Now editable
    avgTemperature: '25', // Now editable
    deployToBlockchain: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.location || !formData.model || !formData.fundingCap || 
        !formData.goalAmount || !formData.avgHumidity || !formData.avgTemperature) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.fundingCap) <= 0) {
      toast.error('Funding cap must be greater than 0');
      return;
    }

    if (parseFloat(formData.goalAmount) <= 0) {
      toast.error('Goal amount must be greater than 0');
      return;
    }

    if (parseFloat(formData.avgHumidity) < 0 || parseFloat(formData.avgHumidity) > 100) {
      toast.error('Humidity must be between 0 and 100%');
      return;
    }

    if (parseFloat(formData.avgTemperature) < -50 || parseFloat(formData.avgTemperature) > 60) {
      toast.error('Temperature must be between -50°C and 60°C');
      return;
    }

    if (!user || !token) {
      toast.error('Please login as admin first');
      return;
    }

    setIsCreating(true);
    let databaseProjectId = null;
    const loadingToast = toast.loading('Creating project...');

    try {
      // Step 1: Create project in database
      setDeploymentStep('Creating project in database...');
      toast.dismiss(loadingToast);
      const dbToast = toast.loading('Creating project in database...');

      const backendData = new FormData();
      
      // Add text fields
      backendData.append('name', formData.name);
      backendData.append('projectName', formData.name); // For backward compatibility
      backendData.append('location', formData.location);
      backendData.append('machineModel', formData.model);
      backendData.append('goalAmount', formData.goalAmount);
      backendData.append('fundingGoal', formData.goalAmount); // For backward compatibility
      backendData.append('avgHumidity', formData.avgHumidity);
      backendData.append('avgTemperature', formData.avgTemperature);
      backendData.append('status', 'SEEKING_FUNDING');
      backendData.append('deployToBlockchain', formData.deployToBlockchain.toString());
      backendData.append('fundingCap', formData.fundingCap); // For blockchain deployment
      backendData.append('beneficiary', formData.beneficiary);
      
      // Add images if selected
      if (images) {
        for (let i = 0; i < images.length; i++) {
          backendData.append('images', images[i]);
        }
      }

      const response = await axios.post('http://localhost:3001/projects', backendData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      databaseProjectId = response.data._id;
      toast.dismiss(dbToast);
      toast.success('Project created in database!');

      // Step 2: Deploy to blockchain (if enabled and wallet connected)
      if (formData.deployToBlockchain && isConnected && account) {
        setDeploymentStep('Deploying to blockchain...');
        const blockchainToast = toast.loading('Deploying to blockchain...');

        try {
          await createProject(
            formData.name,
            formData.location,
            formData.model,
            formData.fundingCap,
            formData.beneficiary || account
          );

          toast.dismiss(blockchainToast);

          // Step 3: Link database project to blockchain project
          setDeploymentStep('Linking projects...');
          const linkToast = toast.loading('Linking database to blockchain...');

                                // Get the actual blockchain project ID that was just created
           const actualBlockchainId = await getActualNextProjectId();
           
           // Get the actual project contract address
           let projectAddress = 'TBD';
           try {
             if (factoryContract) {
               projectAddress = await factoryContract.getProjectAddress(actualBlockchainId);
               console.log('🏭 Got project address:', projectAddress);
             }
           } catch (error) {
             console.warn('Failed to get project address:', error);
           }
           
           await axios.patch(
             `http://localhost:3001/projects/${databaseProjectId}/blockchain`,
             {
               blockchainProjectId: actualBlockchainId,
               blockchainAddress: projectAddress,
             },
             {
               headers: { 'Authorization': `Bearer ${token}` },
             }
           );

          toast.dismiss(linkToast);
          toast.success('🎉 Project fully created and deployed!');

        } catch (blockchainError: any) {
          console.error('Blockchain deployment failed:', blockchainError);
          toast.error('Project created in database but blockchain deployment failed');
        }
      } else {
        toast.success('✅ Project created in database (blockchain deployment skipped)');
      }

              // Reset form
        setFormData({
          name: '',
          location: '',
          model: 'AquaGen-3000',
          fundingCap: '10.0',
          beneficiary: account || '',
          goalAmount: '10000',
          avgHumidity: '75',
          avgTemperature: '25',
          deployToBlockchain: true,
        });
        setImages(null);

      // Refresh projects list
      if (refreshProjects) {
        await refreshProjects();
      }

    } catch (error: any) {
      console.error('Project creation failed:', error);
      
      if (error.response?.status === 401) {
        toast.error('Unauthorized: Please login as admin');
      } else if (error.response?.status === 400) {
        toast.error('Invalid project data');
      } else {
        toast.error('Failed to create project: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsCreating(false);
      setDeploymentStep('');
    }
  };

  // Helper function to get the actual next blockchain project ID
  const getActualNextProjectId = async (): Promise<number> => {
    try {
      if (!factoryContract) {
        console.warn('Factory contract not available, using fallback ID');
        return 1;
      }

      // Get the actual nextProjectId from the blockchain
      const nextProjectId = await factoryContract.nextProjectId();
      const currentProjectId = Number(nextProjectId) - 1; // The ID of the project we just created
      
      console.log('🔍 Blockchain project ID detection:', {
        nextProjectId: Number(nextProjectId),
        currentProjectId,
      });

      return currentProjectId;
    } catch (error) {
      console.error('Failed to get blockchain project ID:', error);
      return 1; // Fallback
    }
  };

  if (!isConnected) {
    return (
      <Card variant="frosted" className="p-6">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <p className="text-secondary">Please connect your wallet to create projects.</p>
      </Card>
    );
  }

  return (
    <Card variant="frosted" className="p-6">
      <h2 className="text-xl font-bold mb-6">Create New Water Machine Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Project Name *
          </label>
          <StyledInput
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Lagos Water Plant #2"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location *
          </label>
          <StyledInput
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Lagos, Nigeria"
            required
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium mb-1">
            Machine Model *
          </label>
          <StyledInput
            id="model"
            name="model"
            type="text"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., AquaGen-3000"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fundingCap" className="block text-sm font-medium mb-1">
              Funding Cap (ETH) *
            </label>
            <StyledInput
              id="fundingCap"
              name="fundingCap"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.fundingCap}
              onChange={handleChange}
              placeholder="10.0"
              required
            />
            <p className="text-xs text-secondary mt-1">
              Blockchain funding limit
            </p>
          </div>

          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium mb-1">
              Goal Amount (USD) *
            </label>
            <StyledInput
              id="goalAmount"
              name="goalAmount"
              type="number"
              min="1"
              value={formData.goalAmount}
              onChange={handleChange}
              placeholder="10000"
              required
            />
            <p className="text-xs text-secondary mt-1">
              Database goal for tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="avgHumidity" className="block text-sm font-medium mb-1">
              Avg. Humidity (%) *
            </label>
            <StyledInput
              id="avgHumidity"
              name="avgHumidity"
              type="number"
              min="0"
              max="100"
              value={formData.avgHumidity}
              onChange={handleChange}
              placeholder="75"
              required
            />
          </div>

          <div>
            <label htmlFor="avgTemperature" className="block text-sm font-medium mb-1">
              Avg. Temperature (°C) *
            </label>
            <StyledInput
              id="avgTemperature"
              name="avgTemperature"
              type="number"
              min="-50"
              max="60"
              value={formData.avgTemperature}
              onChange={handleChange}
              placeholder="25"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium mb-1">
            Project Images (Optional)
          </label>
          <input 
            id="images" 
            type="file" 
            multiple
            accept="image/*"
            className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            onChange={(e) => setImages(e.target.files)}
          />
          <p className="text-xs text-secondary mt-1">
            Upload multiple images for project carousel (JPG, PNG, GIF)
          </p>
        </div>

        <div>
          <label htmlFor="beneficiary" className="block text-sm font-medium mb-1">
            Beneficiary Address
          </label>
          <StyledInput
            id="beneficiary"
            name="beneficiary"
            type="text"
            value={formData.beneficiary}
            onChange={handleChange}
            placeholder={account || '0x...'}
          />
          <p className="text-xs text-secondary mt-1">
            Address that will receive the funding (defaults to your address)
          </p>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isCreating}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isCreating ? 'Creating Project...' : 'Create Project On-Chain'}
          </Button>
        </div>
      </form>

      {/* Deployment Status */}
      {isCreating && deploymentStep && (
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h3 className="text-sm font-medium mb-2">🚀 Deployment Progress</h3>
          <p className="text-sm text-blue-300">{deploymentStep}</p>
          <div className="w-full bg-blue-500/20 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h3 className="text-sm font-medium mb-2">ℹ️ Enhanced Project Creation</h3>
        <ul className="text-xs text-secondary space-y-1">
          <li>• <strong>Dual System:</strong> Projects stored in database AND deployed on blockchain</li>
          <li>• <strong>Database:</strong> Metadata, images, environmental data, operator assignments</li>
          <li>• <strong>Blockchain:</strong> Funding, investments, revenue distribution via smart contracts</li>
          <li>• <strong>Image Upload:</strong> Multiple project images for carousel display</li>
          <li>• <strong>Environmental Data:</strong> Humidity and temperature tracking</li>
          <li>• <strong>Auto-Linking:</strong> Projects automatically linked between both systems</li>
          <li>• <strong>NFT Positions:</strong> Investors receive ERC-721 tokens representing their investment</li>
        </ul>
      </div>
    </Card>
  );
};