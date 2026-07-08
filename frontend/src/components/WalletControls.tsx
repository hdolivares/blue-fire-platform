'use client';

import { useWeb3 } from '@/context/Web3Context';
import { Button } from './ui/Button';
import { WalletIcon, ArrowPathIcon, PowerIcon } from '@heroicons/react/24/outline';

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
      <Button onClick={connectWallet} variant="primary" size="sm">
        <WalletIcon className="h-4 w-4" />
        Connect Wallet
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
          <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-danger' : 'bg-success'} animate-pulse`}></div>
          <span>{formatAddress(account!)}</span>
          <span className="text-xs opacity-70">({chainId})</span>
        </div>
      </Button>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {isWrongNetwork && (
          <Button onClick={switchToAnvilNetwork} variant="warning" size="sm">
            <ArrowPathIcon className="h-4 w-4" />
            Switch Network
          </Button>
        )}

        <Button onClick={disconnectWallet} variant="error" size="sm">
          <PowerIcon className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    </div>
  );
}; 