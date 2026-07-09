// Simple RPC URL configuration
// Set NEXT_PUBLIC_RPC_URL in your .env.local to a keyed endpoint for production.
// The default is the public (tokenless) Rootstock testnet node — no committed
// credential. The previously hardcoded keyed URL was rotated out.

const DEFAULT_RPC_URL = 'https://public-node.testnet.rsk.co';

export const getRpcUrl = (): string => {
  return process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC_URL;
};

// Export for easy access
export const RPC_URL = getRpcUrl(); 