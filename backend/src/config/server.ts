// Server configuration for backend
// Set FRONTEND_URL in your environment to override the default

const DEFAULT_FRONTEND_URL = 'http://app.bluefire.love';

export const getFrontendUrl = (): string => {
  return process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
};

// Export for easy access
export const FRONTEND_URL = getFrontendUrl(); 