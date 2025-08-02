// Simple RPC URL configuration for backend
// Set BLOCKCHAIN_RPC_URL in your environment to override the default

const DEFAULT_RPC_URL = 'https://rpc.testnet.rootstock.io/SPFSilkXeEhpXLxvjyz5le7eiOEvy8-T';

export const getRpcUrl = (): string => {
  return process.env.BLOCKCHAIN_RPC_URL || DEFAULT_RPC_URL;
};

// Export for easy access
export const RPC_URL = getRpcUrl(); 