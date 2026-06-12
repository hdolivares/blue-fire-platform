import React from 'react';

// This should align with the backend enum
type ProjectStatus = 
  | 'SEEKING_FUNDING'
  | 'FUNDED_ORDER_PLACED'
  | 'FUNDED_MACHINE_SHIPPED'
  | 'FUNDED_INSTALLATION_PHASE'
  | 'OPERATIONAL';

interface ProjectStatusInfoProps {
  status: ProjectStatus;
}

// A map of statuses to their informational text and styling
const statusDetailsMap = {
  SEEKING_FUNDING: {
    title: 'Seeking Funding',
    description: 'This project is currently raising funds from investors.',
    style: 'border-border bg-[var(--info-bg)] text-[var(--info-fg)]',
  },
  FUNDED_ORDER_PLACED: {
    title: 'Order Placed',
    description: 'The machine has been ordered. Estimated manufacturing time is 2-3 months.',
    style: 'border-border bg-surface-muted text-brand-secondary',
  },
  FUNDED_MACHINE_SHIPPED: {
    title: 'Machine Shipped',
    description: 'The machine is on its way. Estimated delivery and customs clearance time is 1 month.',
    style: 'border-border bg-[var(--info-bg)] text-[var(--info-fg)]',
  },
  FUNDED_INSTALLATION_PHASE: {
    title: 'Installation Phase',
    description: 'The machine is on-site. Installation and setup will take approximately 2 weeks.',
    style: 'border-border bg-[var(--warning-bg)] text-[var(--warning-fg)]',
  },
  OPERATIONAL: null, // We don't show a specific info box for operational projects
};

export const ProjectStatusInfo = ({ status }: ProjectStatusInfoProps) => {
  const details = statusDetailsMap[status];

  // Don't render anything if the status doesn't have a specific message (e.g., OPERATIONAL)
  if (!details) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg border ${details.style} my-6`}>
      <h4 className="font-bold text-md mb-1">{details.title}</h4>
      <p className="text-sm opacity-90">{details.description}</p>
    </div>
  );
}; 