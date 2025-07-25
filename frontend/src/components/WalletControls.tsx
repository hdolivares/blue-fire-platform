'use client';

import { useWeb3 } from '@/context/Web3Context';
import { Button } from './ui/Button';

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
      <Button 
        onClick={connectWallet}
        variant="primary"
        size="sm"
        className="font-bold"
      >
        🦊 Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Address Button */}
      <Button
        variant="outline"
        size="sm"
        className="font-mono cursor-default"
        onClick={() => {}} // No action needed, just for styling consistency
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          <span>{formatAddress(account!)}</span>
          <span className="text-xs opacity-70">({chainId})</span>
        </div>
      </Button>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {isWrongNetwork && (
          <Button
            onClick={switchToAnvilNetwork}
            variant="warning"
            size="sm"
            className="font-bold"
          >
            🔄 Switch Network
          </Button>
        )}
        
        <Button
          onClick={disconnectWallet}
          variant="error"
          size="sm"
          className="font-bold"
        >
          🔌 Disconnect
        </Button>
      </div>
    </div>
  );
}; 