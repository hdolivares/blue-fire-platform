'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/server';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const SyncControls = () => {
  const { token } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{ synced: number; errors: number } | null>(null);
  const [singleProjectId, setSingleProjectId] = useState('');

  const syncAllProjects = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsSyncing(true);
    const loadingToast = toast.loading('Syncing all projects with blockchain...');

    try {
      const response = await axios.post(
        `${API_URL}/projects/sync/all`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const results = response.data;
      setSyncResults(results);
      
      toast.dismiss(loadingToast);
      toast.success(`Sync completed! ${results.synced} synced, ${results.errors} errors`);
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to sync projects: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSingleProject = async (projectId: string) => {
    if (!token || !projectId.trim()) {
      toast.error('Authentication and project ID required');
      return;
    }

    setIsSyncing(true);
    const loadingToast = toast.loading(`Syncing project ${projectId}...`);

    try {
      await axios.post(
        `${API_URL}/projects/${projectId}/sync`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      toast.dismiss(loadingToast);
      toast.success(`Project ${projectId} synced successfully!`);
    } catch (error: any) {
      console.error('Single sync failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to sync project: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card variant="frosted" className="p-6">
      <h2 className="text-xl font-bold mb-4">Blockchain Sync Controls</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Sync All Projects</h3>
          <p className="text-sm text-secondary mb-3">
            Updates all database projects with current blockchain data (funding amounts, states, etc.)
          </p>
          <Button 
            onClick={syncAllProjects}
            disabled={isSyncing}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isSyncing ? 'Syncing...' : 'Sync All Projects from Blockchain'}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Sync Single Project</h3>
          <p className="text-sm text-secondary mb-3">
            Update a specific project by database ID
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter project database ID (e.g., 6881af21680d7f548c3660c7)"
              className="flex-1 p-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={singleProjectId}
              onChange={(e) => setSingleProjectId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  syncSingleProject(singleProjectId);
                }
              }}
              disabled={isSyncing}
            />
            <Button 
              onClick={() => syncSingleProject(singleProjectId)}
              disabled={isSyncing}
              variant="outline"
            >
              Sync
            </Button>
          </div>
        </div>
      </div>

      {syncResults && (
        <Card variant="default" className="p-4 bg-[var(--success-bg)] border border-success/20">
          <h4 className="text-sm font-medium mb-2">Last Sync Results</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{syncResults.synced}</p>
              <p className="text-xs text-secondary">Projects Synced</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-danger">{syncResults.errors}</p>
              <p className="text-xs text-secondary">Errors</p>
            </div>
          </div>
        </Card>
      )}

      <Card variant="default" className="mt-4 p-4 bg-[var(--info-bg)] border border-brand-primary/20">
        <h4 className="text-sm font-medium mb-2">Sync Information</h4>
        <ul className="text-xs text-secondary space-y-1">
          <li>• <strong>Automatic Sync:</strong> Projects sync automatically after blockchain transactions</li>
          <li>• <strong>Manual Sync:</strong> Use these controls for debugging or fixing data inconsistencies</li>
          <li>• <strong>Sync Updates:</strong> Current funding, project states, progress percentages</li>
          <li>• <strong>Safe Operation:</strong> Sync operations don't modify blockchain data</li>
        </ul>
      </Card>
    </Card>
  );
}; 