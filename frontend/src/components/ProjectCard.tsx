// In frontend/src/components/ProjectCard.tsx
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component

interface Project {
  _id: string;
  projectName: string;
  fundingGoal: number;
  currentFunding: number;
  imageUrl: string; // Add imageUrl to the type
}

export const ProjectCard = ({ project }: { project: Project }) => {
  const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;

  return (
    <Link href={`/dashboard/projects/${project._id}`} className="card-frosted flex flex-col justify-between transition-all duration-300 hover:border-white/60 hover:scale-105 overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full h-40">
        <Image
          src={project.imageUrl}
          alt={project.projectName}
          fill
          className="object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">{project.projectName}</h3>
          <p className="text-gray-300 mb-4">
            Funding Goal: ${project.fundingGoal.toLocaleString()}
          </p>
        </div>

        <div>
          <div className="w-full bg-black/30 rounded-full h-2.5 mb-2">
            <div
              className="bg-gradient-accent h-2.5 rounded-full"
              style={{ width: `${fundingPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-right">{fundingPercentage.toFixed(2)}% Funded</p>
        </div>
      </div>
    </Link>
  );
};