'use client';

import { useWeb3 } from '@/context/Web3Context';
import { GlowingButton } from './GlowingButton';

export const WalletControls = () => {
  const { 
    isConnected, 
    account, 
    chainId,
    connectWallet, 
    disconnectWallet, 
    switchToAnvilNetwork 
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isWrongNetwork = chainId !== null && ![31337, 1337, 42].includes(chainId);

  if (!isConnected) {
    return (
      <GlowingButton onClick={connectWallet}>
        🦊 Connect Wallet
      </GlowingButton>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Info */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
        <span className="text-sm font-mono">{formatAddress(account!)}</span>
        <span className="text-xs text-gray-400">({chainId})</span>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {isWrongNetwork && (
          <button
            onClick={switchToAnvilNetwork}
            className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded transition-colors font-medium"
            title="Switch to Localhost Network"
          >
            🔄 Switch Network
          </button>
        )}
        
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
          title="Disconnect Wallet"
        >
          🔌 Disconnect
        </button>
      </div>
    </div>
  );
}; 