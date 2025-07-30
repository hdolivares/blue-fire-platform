'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type ProjectStatus = 
  | 'SEEKING_FUNDING'
  | 'FUNDED_ORDER_PLACED'
  | 'FUNDED_MACHINE_SHIPPED'
  | 'FUNDED_INSTALLATION_PHASE'
  | 'OPERATIONAL';

interface Project {
  _id: string;
  name: string;
  projectName: string;
  status: ProjectStatus;
  blockchainProjectId?: number;
  blockchainAddress?: string;
  deployedOnChain?: boolean;
  operator?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ProjectManagementProps {
  project: Project;
  onProjectUpdate: () => void;
}

export const ProjectManagement = ({ project, onProjectUpdate }: ProjectManagementProps) => {
  const { token } = useAuth();
  const { 
    isConnected, 
    account, 
    projects: onChainProjects,
    setAlice, 
    approveEscrowRelease, 
    releaseEscrow,
    connectWallet 
  } = useWeb3();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [onChainProject, setOnChainProject] = useState<any>(null);

  useEffect(() => {
    if (project.blockchainProjectId && onChainProjects.length > 0) {
      const onChain = onChainProjects.find(p => p.projectId === project.blockchainProjectId);
      setOnChainProject(onChain);
    }
  }, [project.blockchainProjectId, onChainProjects]);

  const statusProgression: ProjectStatus[] = [
    'SEEKING_FUNDING',
    'FUNDED_ORDER_PLACED',
    'FUNDED_MACHINE_SHIPPED', 
    'FUNDED_INSTALLATION_PHASE',
    'OPERATIONAL'
  ];

  const getNextStatus = (currentStatus: ProjectStatus): ProjectStatus | null => {
    const currentIndex = statusProgression.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusProgression.length - 1) {
      return statusProgression[currentIndex + 1];
    }
    return null;
  };

  const canProgressStatus = (currentStatus: ProjectStatus): boolean => {
    // Can only progress if project is funded (not SEEKING_FUNDING)
    return currentStatus !== 'SEEKING_FUNDING' && getNextStatus(currentStatus) !== null;
  };

  const updateProjectStatus = async (newStatus: ProjectStatus) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading(`Updating project status to ${newStatus.replace(/_/g, ' ')}...`);

    try {
      await axios.patch(
        `http://localhost:3001/admin/projects/${project._id}/status`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      toast.dismiss(loadingToast);
      toast.success(`✅ Project status updated to ${newStatus.replace(/_/g, ' ')}`);
      onProjectUpdate();
    } catch (error: any) {
      console.error('Status update failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to update status: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetAlice = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!project.blockchainProjectId) {
      toast.error('Project not deployed on blockchain');
      return;
    }

    if (!project.operator) {
      toast.error('No operator assigned to this project');
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading('Setting Alice operator on blockchain...');

    try {
      await setAlice(project.blockchainProjectId, account!);
      
      toast.dismiss(loadingToast);
      toast.success(`✅ Alice set to ${account} on blockchain`);
      
      // Trigger project sync
      await axios.post(
        `http://localhost:3001/projects/${project._id}/sync-after-transaction`,
        { transactionType: 'state_change' }
      );
      
      onProjectUpdate();
    } catch (error: any) {
      console.error('Set Alice failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to set Alice: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveEscrowRelease = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!project.blockchainProjectId) {
      toast.error('Project not deployed on blockchain');
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading('Approving escrow release...');

    try {
      await approveEscrowRelease(project.blockchainProjectId);
      
      toast.dismiss(loadingToast);
      toast.success('✅ Escrow release approved on blockchain');
      
      // Trigger project sync
      await axios.post(
        `http://localhost:3001/projects/${project._id}/sync-after-transaction`,
        { transactionType: 'state_change' }
      );
      
      onProjectUpdate();
    } catch (error: any) {
      console.error('Approve escrow release failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to approve escrow release: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReleaseEscrow = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!project.blockchainProjectId) {
      toast.error('Project not deployed on blockchain');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to release the escrow? This action cannot be undone and will transfer funds to the operator.'
    );

    if (!confirmed) return;

    setIsUpdating(true);
    const loadingToast = toast.loading('Releasing escrow...');

    try {
      await releaseEscrow(project.blockchainProjectId);
      
      toast.dismiss(loadingToast);
      toast.success('✅ Escrow released successfully');
      
      // Trigger project sync
      await axios.post(
        `http://localhost:3001/projects/${project._id}/sync-after-transaction`,
        { transactionType: 'state_change' }
      );
      
      onProjectUpdate();
    } catch (error: any) {
      console.error('Release escrow failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to release escrow: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const nextStatus = getNextStatus(project.status);

  return (
    <div className="space-y-6">
      {/* Status Management */}
      <Card variant="frosted" className="p-6">
        <h2 className="text-xl font-bold mb-4">📋 Project Status Management</h2>
        
        <div className="mb-4">
          <p className="text-sm text-secondary mb-2">Current Status:</p>
          <Badge 
            variant={project.status === 'OPERATIONAL' ? 'success' : 'pending'} 
            size="lg"
          >
            {project.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Status Progression:</h3>
          <div className="flex flex-wrap gap-2">
            {statusProgression.map((status, index) => {
              const currentIndex = statusProgression.indexOf(project.status);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={status} className="flex items-center">
                  <Badge 
                    variant={isCompleted ? (isCurrent ? 'success' : 'info') : 'pending'}
                    size="sm"
                    className={isCurrent ? 'ring-2 ring-blue-400' : ''}
                  >
                    {status.replace(/_/g, ' ')}
                  </Badge>
                  {index < statusProgression.length - 1 && (
                    <span className="mx-2 text-secondary">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {nextStatus && canProgressStatus(project.status) && (
          <Button
            onClick={() => updateProjectStatus(nextStatus)}
            disabled={isUpdating}
            variant="primary"
            className="w-full mb-4"
          >
            {isUpdating ? 'Updating...' : `Progress to ${nextStatus.replace(/_/g, ' ')}`}
          </Button>
        )}

        {project.status === 'SEEKING_FUNDING' && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ Project must receive funding before status can be progressed
            </p>
          </div>
        )}
      </Card>

      {/* Blockchain Administration */}
      {project.deployedOnChain && (
        <Card variant="frosted" className="p-6">
          <h2 className="text-xl font-bold mb-4">⛓️ Blockchain Administration</h2>
          
          {!isConnected ? (
            <div className="text-center">
              <p className="text-secondary mb-4">Connect your wallet to access blockchain functions</p>
              <Button onClick={connectWallet} variant="primary">
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="font-medium mb-2">Set Alice Operator</h3>
                  <p className="text-sm text-secondary mb-3">
                    Assign the current wallet as the Alice operator on the blockchain
                  </p>
                  {onChainProject?.alice === account ? (
                    <Badge variant="success" size="sm">✅ Alice Already Set</Badge>
                  ) : (
                    <Button
                      onClick={handleSetAlice}
                      disabled={isUpdating || !project.operator}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isUpdating ? 'Setting...' : 'Set Alice'}
                    </Button>
                  )}
                  {!project.operator && (
                    <p className="text-xs text-red-400 mt-2">
                      Assign an operator first
                    </p>
                  )}
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="font-medium mb-2">Approve Escrow Release</h3>
                  <p className="text-sm text-secondary mb-3">
                    Approve the release of escrowed funds to the operator
                  </p>
                  {onChainProject?.escrowReleaseApproved ? (
                    <Badge variant="success" size="sm">✅ Release Approved</Badge>
                  ) : (
                    <Button
                      onClick={handleApproveEscrowRelease}
                      disabled={isUpdating || project.status !== 'OPERATIONAL'}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isUpdating ? 'Approving...' : 'Approve Release'}
                    </Button>
                  )}
                  {project.status !== 'OPERATIONAL' && (
                    <p className="text-xs text-yellow-400 mt-2">
                      Project must be operational
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h3 className="font-medium mb-2">⚠️ Release Escrow</h3>
                <p className="text-sm text-secondary mb-3">
                  Release escrowed funds to the operator. This action is irreversible.
                </p>
                <Button
                  onClick={handleReleaseEscrow}
                  disabled={isUpdating || !onChainProject?.escrowReleaseApproved}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/50 hover:bg-red-500/20"
                >
                  {isUpdating ? 'Releasing...' : 'Release Escrow'}
                </Button>
                {!onChainProject?.escrowReleaseApproved && (
                  <p className="text-xs text-red-400 mt-2">
                    Must approve release first
                  </p>
                )}
              </div>

              {onChainProject && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">📊 Blockchain Status</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-secondary">Project State:</span>
                      <span className="ml-2 font-medium">
                        {onChainProject.state === 0 ? 'SEEKING_FUNDING' :
                         onChainProject.state === 1 ? 'FUNDED' :
                         onChainProject.state === 2 ? 'OPERATIONAL' : 'CLOSED'}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">Alice:</span>
                      <span className="ml-2 font-medium">
                        {onChainProject.alice === '0x0000000000000000000000000000000000000000' ? 
                         'Not Set' : `${onChainProject.alice.slice(0, 8)}...`}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">Total Funded:</span>
                      <span className="ml-2 font-medium">{onChainProject.totalFunded} ETH</span>
                    </div>
                    <div>
                      <span className="text-secondary">Escrow Approved:</span>
                      <span className="ml-2 font-medium">
                        {onChainProject.escrowReleaseApproved ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}; 