// Server configuration for backend
// Set FRONTEND_URL in your environment to override the default

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

export const getFrontendUrl = (): string => {
  return process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
};

// Export for easy access
export const FRONTEND_URL = getFrontendUrl(); 