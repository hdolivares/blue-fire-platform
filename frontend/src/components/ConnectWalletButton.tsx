'use client';

import { useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';

interface ConnectWalletButtonProps {
  onAccountChanged?: (address: string | null) => void;
}

export const ConnectWalletButton = ({ onAccountChanged }: ConnectWalletButtonProps) => {
  const { isConnected, account, connectWallet, disconnectWallet, switchToAnvilNetwork, chainId } = useWeb3();

  // Notify parent component when account changes
  useEffect(() => {
    if (onAccountChanged) {
      onAccountChanged(isConnected ? account : null);
    }
  }, [isConnected, account, onAccountChanged]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isWrongNetwork = chainId !== null && ![31337, 1337, 42].includes(chainId);

  const getNetworkStatus = () => {
    if (!chainId) return null;
    
    const acceptedNetworks = [31337, 1337, 42];
    const isAcceptedNetwork = acceptedNetworks.includes(chainId);
    
    if (isAcceptedNetwork) {
      const networkNames: { [key: number]: string } = {
        31337: 'Anvil (Preferred)',
        1337: 'Localhost',
        42: 'Legacy Testnet'
      };
      
      return (
        <div className="text-center p-2 rounded-lg bg-[var(--success-bg)] text-[var(--success-fg)] border border-success mb-2">
          <p className="text-xs">✅ Connected to {networkNames[chainId]} ({chainId})</p>
          {chainId !== 31337 && (
            <p className="text-xs text-warning mt-1">💡 Chain 31337 is preferred for Anvil</p>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center p-3 rounded-lg bg-[var(--danger-bg)] text-[var(--danger-fg)] border border-danger mb-2">
          <p className="text-xs mb-2">❌ Wrong network detected!</p>
          <p className="text-xs mb-2">Current: {chainId} | Supported: {acceptedNetworks.join(', ')}</p>
          <button
            onClick={switchToAnvilNetwork}
            className="px-3 py-1 text-xs bg-brand-primary hover:bg-brand-primary text-on-brand rounded transition-colors font-medium"
          >
            🔄 Switch to RSK Testnet
          </button>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Network Status */}
      {isConnected && getNetworkStatus()}
      
      {/* Wallet Connection Status */}
      {isConnected && account ? (
        <div className="text-center p-4 rounded-lg bg-[var(--success-bg)] text-[var(--success-fg)] border border-success">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">Wallet Connected</p>
          </div>
          <p className="font-mono text-sm break-all">{formatAddress(account)}</p>
          {chainId && (
            <p className="text-xs text-text-secondary mt-1">Chain ID: {chainId}</p>
          )}
          
          {/* Wallet Management Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={disconnectWallet}
              className="flex-1 py-2 px-3 text-xs bg-danger hover:bg-danger text-on-brand rounded transition-colors font-medium"
            >
              🔌 Disconnect
            </button>
            {isWrongNetwork && (
              <button
                onClick={switchToAnvilNetwork}
                className="flex-1 py-2 px-3 text-xs bg-brand-primary hover:bg-brand-primary text-on-brand rounded transition-colors font-medium"
              >
                🔄 Switch Network
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Connect Wallet Button */
        <button
          onClick={connectWallet}
          className="w-full py-3 px-4 rounded-md gradient-brand text-on-brand font-bold transition-all hover:scale-105 hover:shadow-lg"
        >
          🦊 Connect Wallet to Invest
        </button>
      )}
      
      {/* Quick Actions for Connected Users */}
      {isConnected && (
        <div className="flex gap-2 text-center">
          <button
            onClick={connectWallet}
            className="flex-1 py-2 px-3 text-xs bg-surface-muted text-text-primary hover:bg-surface-muted rounded transition-colors"
          >
            🔄 Reconnect
          </button>
          <button
            onClick={switchToAnvilNetwork}
            className="flex-1 py-2 px-3 text-xs bg-brand-secondary hover:bg-brand-secondary text-on-brand rounded transition-colors"
          >
            🌐 Switch Network
          </button>
        </div>
      )}
    </div>
  );
};