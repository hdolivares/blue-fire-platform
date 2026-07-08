'use client';

import { useState, useEffect, useMemo } from 'react';
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
  TimeScale,
  ChartOptions,
  ChartData,
} from 'chart.js';
import 'chart.js/auto'; // Using auto import for simplicity
import api from '@/lib/axios';
import { subMonths, format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { cssVar, tint, baseLineOptions, valueAxis } from '@/lib/chart-theme';

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// This should match the backend enum for MachineStatus
enum MachineStatus {
  OPERATIONAL = 'OPERATIONAL',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
}

// Data structure for a single performance data point from the API
interface PerformanceDataPoint {
  timestamp: string;
  kwhPerLiter: number;
  humidity: number;
  temperature: number;
  machineStatus: MachineStatus;
}

interface PerformanceChartProps {
  projectId: string;
}

export const PerformanceChart = ({ projectId }: PerformanceChartProps) => {
  const { theme } = useTheme();
  const [data, setData] = useState<PerformanceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to last month
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [activeFilter, setActiveFilter] = useState<'1M' | '3M' | '6M' | '1Y' | 'Custom'>('1M');
  const [showCustom, setShowCustom] = useState(false);


  const fetchData = async (start: string, end: string) => {
    if (!start || !end) {
      setError('Please select both a start and end date.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/performance/${projectId}/historical`, {
        params: { startDate: start, endDate: end },
      });
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError('Failed to load performance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial component mount and when date range changes
  useEffect(() => {
    fetchData(startDate, endDate);
  }, [projectId, startDate, endDate]);

  const handleQuickFilter = (months: number, filterName: '1M' | '3M' | '6M' | '1Y') => {
    const end = new Date();
    const start = subMonths(end, months);
    const formattedStart = format(start, 'yyyy-MM-dd');
    const formattedEnd = format(end, 'yyyy-MM-dd');
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    setActiveFilter(filterName);
    setShowCustom(false);
    // No need to call fetchData here, useEffect will handle it
  };
  
  const handleCustomFilter = () => {
    setActiveFilter('Custom');
    setShowCustom(true);
  };

  const handleLoadCustomDate = () => {
    fetchData(startDate, endDate);
  }

  const chartData: ChartData<'line'> = useMemo(() => {
    const labels = data.map(d => new Date(d.timestamp).toLocaleString());
    const cyan = cssVar('--brand-primary', '#56d9ff');
    const aqua = cssVar('--brand-secondary', '#19a8e6');
    const ember = cssVar('--accent', '#ff7847');
    return {
      labels,
      datasets: [
        {
          label: 'kWh / L',
          data: data.map(d => d.kwhPerLiter),
          borderColor: cyan,
          backgroundColor: tint(cyan, 18),
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Humidity %',
          data: data.map(d => d.humidity),
          borderColor: aqua,
          backgroundColor: tint(aqua, 12),
          // cyan & aqua are adjacent hues — dash the humidity line to separate
          borderDash: [5, 4],
          yAxisID: 'y1',
        },
        {
          label: 'Temp °C',
          data: data.map(d => d.temperature),
          borderColor: ember,
          backgroundColor: tint(ember, 12),
          yAxisID: 'y1',
        },
      ],
    };
    // theme is a dependency so colors re-resolve when the user toggles themes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, theme]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => {
    const base = baseLineOptions();
    return {
      ...base,
      plugins: {
        ...base.plugins,
        tooltip: {
          ...base.plugins!.tooltip,
          callbacks: {
            footer: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              const status = data[index]?.machineStatus;
              return status ? `STATUS: ${status}` : '';
            },
          },
        },
      },
      scales: {
        ...base.scales,
        y: valueAxis('kWh / L', 'left', true),
        y1: valueAxis('Temp / Humidity', 'right', false),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, theme]);

  const quickFilters = [
    { label: 'Last Month', value: '1M', months: 1 },
    { label: '3 Months', value: '3M', months: 3 },
    { label: '6 Months', value: '6M', months: 6 },
    { label: '1 Year', value: '1Y', months: 12 },
  ] as const;

  return (
    <Card variant="frosted" className="p-6">
      <p className="kicker mb-2"><b>◇</b> Telemetry</p>
      <h3 className="display-caps text-2xl mb-4">Performance analysis</h3>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {quickFilters.map(filter => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter(filter.months, filter.value)}
          >
            {filter.label}
          </Button>
        ))}
        <Button
          variant={activeFilter === 'Custom' ? 'primary' : 'outline'}
          size="sm"
          onClick={handleCustomFilter}
        >
          Custom
        </Button>
      </div>

      {/* Custom Date Range Picker */}
      {showCustom && (
        <div className="flex items-end space-x-4 mb-4 p-4 border border-border rounded-lg">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="">
            <Button onClick={handleLoadCustomDate} disabled={loading} variant="primary">
              {loading ? 'Loading...' : 'Load Chart'}
            </Button>
          </div>
        </div>
      )}
      
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <div className="relative h-96">
        {data.length > 0 ? (
          <Line options={chartOptions} data={chartData} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
             <p className="text-text-secondary">
                {loading ? 'Fetching data...' : 'Please select a date range and load the chart to view performance data.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}; 