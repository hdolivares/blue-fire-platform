// In frontend/src/components/ProjectCard.tsx

// Define the type for the props this component will receive
interface Project {
  _id: string;
  projectName: string;
  fundingGoal: number;
  currentFunding: number;
}

export const ProjectCard = ({ project }: { project: Project }) => {
  const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;

  return (
    <div className="card-frosted p-6 flex flex-col justify-between">
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
  );
};