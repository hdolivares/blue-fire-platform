// In frontend/src/components/admin/CreateProjectForm.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { StyledInput } from '@/components/StyledInput';

export const CreateProjectForm = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [location, setLocation] = useState('');
  const [avgHumidity, setAvgHumidity] = useState('');
  const [avgTemperature, setAvgTemperature] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const projectData = {
      projectName,
      fundingGoal: Number(fundingGoal),
      location,
      avgHumidity: Number(avgHumidity),
      avgTemperature: Number(avgTemperature),
    };

    try {
      await axios.post('http://localhost:3001/projects', projectData);
      alert('Project created successfully!');
      router.push('/dashboard'); // Go to investor dashboard to see it
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project.');
    }
  };

  return (
    <div className="card-frosted max-w-2xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="projectName">Project Name</label>
            <StyledInput id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="fundingGoal">Funding Goal ($)</label>
            <StyledInput id="fundingGoal" type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="location">Location</label>
            <StyledInput id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="avgHumidity">Avg. Humidity (%)</label>
            <StyledInput id="avgHumidity" type="number" value={avgHumidity} onChange={(e) => setAvgHumidity(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="avgTemperature">Avg. Temperature (°C)</label>
            <StyledInput id="avgTemperature" type="number" value={avgTemperature} onChange={(e) => setAvgTemperature(e.target.value)} required />
          </div>
        </div>

        {/* We will add the file upload input here in the next step */}

        <button type="submit" className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6 transition-all hover:brightness-110">
          Create Project
        </button>
      </form>
    </div>
  );
};