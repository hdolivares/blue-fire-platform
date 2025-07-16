// In frontend/src/components/StatCard.tsx
import { Card } from './ui/Card';

interface StatCardProps {
  title: string;
  value: string;
}

export const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <Card variant="frosted" className="p-6">
      <h3 className="text-secondary text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
};