// In frontend/src/components/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string;
}

export const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <div className="card-frosted p-6">
      <h3 className="text-gray-300 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};