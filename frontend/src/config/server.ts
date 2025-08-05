// Server configuration for frontend
// Set NEXT_PUBLIC_API_URL in your .env.local file to override the default

const DEFAULT_API_URL = 'https://161.35.225.243:3001';

export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
};

// Export for easy access
export const API_URL = getApiUrl(); 