// Simple RPC URL configuration
// Set NEXT_PUBLIC_RPC_URL in your .env.local file to override the default

const DEFAULT_RPC_URL = 'https://rpc.testnet.rootstock.io/pcUMq8MauxoiT8suuCGXZaB8DA2vYD-T';

export const getRpcUrl = (): string => {
  return process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC_URL;
};

// Export for easy access
export const RPC_URL = getRpcUrl(); 