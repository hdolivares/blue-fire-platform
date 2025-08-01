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
        <div className="text-center p-2 rounded-lg bg-green-500/20 border border-green-500 mb-2">
          <p className="text-xs">✅ Connected to {networkNames[chainId]} ({chainId})</p>
          {chainId !== 31337 && (
            <p className="text-xs text-yellow-300 mt-1">💡 Chain 31337 is preferred for Anvil</p>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center p-3 rounded-lg bg-red-500/20 border border-red-500 mb-2">
          <p className="text-xs mb-2">❌ Wrong network detected!</p>
          <p className="text-xs mb-2">Current: {chainId} | Supported: {acceptedNetworks.join(', ')}</p>
          <button
            onClick={switchToAnvilNetwork}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors font-medium"
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
        <div className="text-center p-4 rounded-lg bg-green-500/20 border border-green-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">Wallet Connected</p>
          </div>
          <p className="font-mono text-sm break-all">{formatAddress(account)}</p>
          {chainId && (
            <p className="text-xs text-gray-400 mt-1">Chain ID: {chainId}</p>
          )}
          
          {/* Wallet Management Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={disconnectWallet}
              className="flex-1 py-2 px-3 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
            >
              🔌 Disconnect
            </button>
            {isWrongNetwork && (
              <button
                onClick={switchToAnvilNetwork}
                className="flex-1 py-2 px-3 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors font-medium"
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
          className="w-full py-3 px-4 rounded-md bg-gradient-primary text-blue-900 font-bold transition-all hover:scale-105 hover:shadow-lg"
        >
          🦊 Connect Wallet to Invest
        </button>
      )}
      
      {/* Quick Actions for Connected Users */}
      {isConnected && (
        <div className="flex gap-2 text-center">
          <button
            onClick={connectWallet}
            className="flex-1 py-2 px-3 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            🔄 Reconnect
          </button>
          <button
            onClick={switchToAnvilNetwork}
            className="flex-1 py-2 px-3 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            🌐 Switch Network
          </button>
        </div>
      )}
    </div>
  );
};