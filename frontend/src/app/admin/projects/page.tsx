'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

interface Project {
  _id: string;
  name?: string;
  projectName: string;
  location: string;
  status: 'SEEKING_FUNDING' | 'FUNDED_ORDER_PLACED' | 'FUNDED_MACHINE_SHIPPED' | 'FUNDED_INSTALLATION_PHASE' | 'OPERATIONAL';
  goalAmount?: number;
  currentAmount?: number;
  blockchainProjectId?: number;
  blockchainAddress?: string;
  deployedOnChain?: boolean;
  avgHumidity?: number;
  avgTemperature?: number;
  operator?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectStats {
  totalProjects: number;
  seekingFundingProjects: number;
  fundedProjects: number;
  operationalProjects: number;
  totalFundingGoal?: number;
  totalCurrentFunding?: number;
  fundingProgress?: number;
}

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'seeking' | 'funded' | 'operational'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, statsRes] = await Promise.all([
          api.get('/admin/projects'),
          api.get('/admin/project-stats'),
        ]);
        
        console.log('Projects data:', projectsRes.data);
        console.log('Stats data:', statsRes.data);
        
        // Ensure projects is an array
        const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        setProjects(projectsData);
        setStats(statsRes.data || {});
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Set empty defaults on error
        setProjects([]);
        setStats({
          totalProjects: 0,
          seekingFundingProjects: 0,
          fundedProjects: 0,
          operationalProjects: 0,
          totalFundingGoal: 0,
          totalCurrentFunding: 0,
          fundingProgress: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}, ${year}`;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SEEKING_FUNDING':
        return 'warning';
      case 'FUNDED_ORDER_PLACED':
      case 'FUNDED_MACHINE_SHIPPED':
      case 'FUNDED_INSTALLATION_PHASE':
        return 'info';
      case 'OPERATIONAL':
        return 'success';
      default:
        return 'pending';
    }
  };

  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'seeking':
        return projects.filter(p => p.status === 'SEEKING_FUNDING');
      case 'funded':
        return projects.filter(p => ['FUNDED_ORDER_PLACED', 'FUNDED_MACHINE_SHIPPED', 'FUNDED_INSTALLATION_PHASE'].includes(p.status));
      case 'operational':
        return projects.filter(p => p.status === 'OPERATIONAL');
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">Loading project data...</div>
      </main>
    );
  }

  return (
    <main className="container-main">
      <div className="mb-8">
        <h1 className="section-header">Project Management</h1>
        <p className="text-secondary">Manage and monitor all projects and their progress</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Projects" 
            value={stats.totalProjects.toString()} 
          />
          <StatCard 
            title="Seeking Funding" 
            value={stats.seekingFundingProjects.toString()} 
          />
          <StatCard 
            title="Funded Projects" 
            value={stats.fundedProjects.toString()} 
          />
          <StatCard 
            title="Operational" 
            value={stats.operationalProjects.toString()} 
          />
        </div>
      )}

             {/* Additional Stats Row */}
       {stats && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <StatCard 
             title="Total Funding Goal" 
             value={`$${(stats.totalFundingGoal || 0).toLocaleString()}`} 
           />
           <StatCard 
             title="Total Raised" 
             value={`$${(stats.totalCurrentFunding || 0).toLocaleString()}`} 
           />
           <StatCard 
             title="Overall Progress" 
             value={`${(stats.fundingProgress || 0).toFixed(1)}%`} 
           />
         </div>
       )}

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setActiveTab('all')}
          variant={activeTab === 'all' ? 'primary' : 'outline'}
          size="sm"
        >
          All Projects ({projects.length})
        </Button>
        <Button
          onClick={() => setActiveTab('seeking')}
          variant={activeTab === 'seeking' ? 'primary' : 'outline'}
          size="sm"
        >
          Seeking Funding ({stats?.seekingFundingProjects || 0})
        </Button>
        <Button
          onClick={() => setActiveTab('funded')}
          variant={activeTab === 'funded' ? 'primary' : 'outline'}
          size="sm"
        >
          Funded ({stats?.fundedProjects || 0})
        </Button>
        <Button
          onClick={() => setActiveTab('operational')}
          variant={activeTab === 'operational' ? 'primary' : 'outline'}
          size="sm"
        >
          Operational ({stats?.operationalProjects || 0})
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <Link href="/admin/projects/new">
          <Button variant="success" size="sm">
            + Create New Project
          </Button>
        </Link>
      </div>

      {/* Projects Table */}
      <Card variant="frosted" className="p-6">
        <h2 className="section-header">
          {activeTab === 'all' ? 'All Projects' :
           activeTab === 'seeking' ? 'Projects Seeking Funding' :
           activeTab === 'funded' ? 'Funded Projects' :
           'Operational Projects'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">Project Name</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Funding</th>
                <th className="text-left py-3 px-4">Progress</th>
                <th className="text-left py-3 px-4">Operator</th>
                <th className="text-left py-3 px-4">Blockchain</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                // Defensive check for project data
                if (!project || !project._id) {
                  console.warn('Invalid project data:', project);
                  return null;
                }
                
                return (
                <tr key={project._id} className="border-b border-white/10 hover:bg-white/5">
                                                        <td className="py-3 px-4">
                     <div>
                       <div className="font-semibold">{project.name || project.projectName || 'Unnamed Project'}</div>
                       <div className="text-sm text-secondary">
                         {project.avgHumidity || 0}% humidity • {project.avgTemperature || 0}°C
                       </div>
                     </div>
                   </td>
                   <td className="py-3 px-4 text-secondary">{project.location || 'Unknown'}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={getStatusVariant(project.status)}
                      size="sm"
                    >
                      {formatStatus(project.status)}
                    </Badge>
                  </td>
                                     <td className="py-3 px-4">
                     <div>
                       <div className="font-semibold">
                         ${(project.currentAmount || 0).toLocaleString()} / ${(project.goalAmount || 0).toLocaleString()}
                       </div>
                       <div className="text-sm text-secondary">
                         {project.goalAmount ? ((project.currentAmount || 0) / project.goalAmount * 100).toFixed(1) : '0.0'}% funded
                       </div>
                     </div>
                   </td>
                   <td className="py-3 px-4">
                     <div className="w-full bg-white/10 rounded-full h-2">
                       <div 
                         className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                         style={{ width: `${project.goalAmount ? Math.min(((project.currentAmount || 0) / project.goalAmount) * 100, 100) : 0}%` }}
                       ></div>
                     </div>
                   </td>
                  <td className="py-3 px-4">
                    {project.operator ? (
                      <div>
                        <div className="font-semibold text-sm">
                          {project.operator.firstName} {project.operator.lastName}
                        </div>
                        <div className="text-xs text-secondary">{project.operator.email}</div>
                      </div>
                    ) : (
                      <span className="text-secondary text-sm">Not assigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {project.deployedOnChain ? (
                      <div>
                        <Badge variant="success" size="sm">On-chain</Badge>
                        <div className="text-xs text-secondary mt-1">
                          ID: {project.blockchainProjectId}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="pending" size="sm">Database Only</Badge>
                    )}
                  </td>
                                     <td className="py-3 px-4 text-secondary text-sm">
                     {project.createdAt ? formatDate(project.createdAt) : 'Unknown'}
                   </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/projects/${project._id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                                         </Link>
                   </td>
                 </tr>
                );
               })}
             </tbody>
          </table>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-8 text-secondary">
              No projects found for the selected filter.
            </div>
          )}
        </div>
      </Card>
    </main>
  );
} 