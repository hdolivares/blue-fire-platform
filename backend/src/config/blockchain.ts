// Simple RPC URL configuration for backend
// Set BLOCKCHAIN_RPC_URL in your environment to a keyed endpoint for production.
// The default is the public (tokenless) Rootstock testnet node — no committed
// credential. The previously hardcoded keyed URL was rotated out.

const DEFAULT_RPC_URL = 'https://public-node.testnet.rsk.co';

export const getRpcUrl = (): string => {
  return process.env.BLOCKCHAIN_RPC_URL || DEFAULT_RPC_URL;
};

// Export for easy access
export const RPC_URL = getRpcUrl(); 