'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Add the new climate fields to our Project type
interface Project {
  projectName: string;
  status: string;
  imageUrl: string;
  imageUrls: string[];
  avgHumidity: number;
  avgTemperature: number;
}
interface PerformanceData {
  date: string;
  waterProduction: number;
}

// Helper function to format the status text
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function ProjectDetailPage() {
  const params = useParams();
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3001/projects/${id}`)
        .then(response => setProject(response.data))
        .catch(error => console.error('Failed to fetch project details:', error));

      axios.get(`http://localhost:3001/performance/${id}`)
        .then(response => setPerformanceData(response.data))
        .catch(error => console.error('Failed to fetch performance data:', error));
    }
  }, [id]);

  if (!project) {
    return <div className="text-center p-10">Loading...</div>;
  }
  
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

  const avgWaterProduction = performanceData.reduce((acc, item) => acc + item.waterProduction, 0) / performanceData.length;

  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* Carousel or single image */}
      {project.imageUrls && project.imageUrls.length > 0 ? (
        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Carousel showThumbs={false} autoPlay infiniteLoop showStatus={false}>
            {project.imageUrls.map((url, index) => (
              <div key={index} className="relative w-full h-96">
                <Image src={url} alt={`${project.projectName} image ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="relative w-full h-60 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Image src={project.imageUrl} alt={project.projectName} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}

      <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-2">{project.projectName}</h1>
      
      {/* Formatted Status Label and Text */}
      <div className="flex items-center space-x-2">
        <span className="text-lg text-gray-400">Project Current Status:</span>
        <span className="text-lg text-green-400 font-semibold">{formatStatus(project.status)}</span>
      </div>

      {/* Grid for all Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="card-frosted p-6">
          <h3 className="text-gray-300 text-sm">Average Daily Water Production</h3>
          <p className="text-3xl font-bold">{!isNaN(avgWaterProduction) ? avgWaterProduction.toFixed(0) : '0'} L</p>
        </div>
        
        {/* New Stat Cards for Climate Conditions */}
        <div className="card-frosted p-6">
          <h3 className="text-gray-300 text-sm">Avg. Humidity</h3>
          <p className="text-3xl font-bold">{project.avgHumidity}%</p>
        </div>
        <div className="card-frosted p-6">
          <h3 className="text-gray-300 text-sm">Avg. Temperature</h3>
          <p className="text-3xl font-bold">{project.avgTemperature}°C</p>
        </div>
      </div>

      <div className="card-frosted p-6">
        <h2 className="text-2xl font-bold mb-4">Historical Performance</h2>
        <div className="relative h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </main>
  );
}