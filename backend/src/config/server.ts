// Server configuration for backend
// Set FRONTEND_URL in your environment to override the default

const DEFAULT_FRONTEND_URL = 'http://161.35.225.243:80';

export const getFrontendUrl = (): string => {
  return process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
};

// Export for easy access
export const FRONTEND_URL = getFrontendUrl(); 