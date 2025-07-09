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
  const [images, setImages] = useState<FileList | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(); // We use FormData for file uploads
    formData.append('projectName', projectName);
    formData.append('fundingGoal', fundingGoal);
    formData.append('location', location);
    formData.append('avgHumidity', avgHumidity);
    formData.append('avgTemperature', avgTemperature);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      // Send the FormData object with the correct headers
      await axios.post('http://localhost:3001/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
            <label htmlFor="projectName" className="block text-sm font-medium mb-1">Project Name</label>
            <StyledInput id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="fundingGoal" className="block text-sm font-medium mb-1">Funding Goal ($)</label>
            <StyledInput id="fundingGoal" type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
            <StyledInput id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="avgHumidity" className="block text-sm font-medium mb-1">Avg. Humidity (%)</label>
            <StyledInput id="avgHumidity" type="number" value={avgHumidity} onChange={(e) => setAvgHumidity(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="avgTemperature" className="block text-sm font-medium mb-1">Avg. Temperature (°C)</label>
            <StyledInput id="avgTemperature" type="number" value={avgTemperature} onChange={(e) => setAvgTemperature(e.target.value)} required />
          </div>
        </div>
        
        <div>
            <label htmlFor="images" className="block text-sm font-medium mb-1">Project Images (Carousel)</label>
            <input 
              id="images" 
              type="file" 
              multiple
              className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              onChange={(e) => setImages(e.target.files)}
            />
        </div>

        <button type="submit" className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6 transition-all duration-300 hover:brightness-110">
          Create Project
        </button>
      </form>
    </div>
  );
};