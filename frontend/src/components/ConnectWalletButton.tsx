'use client';

import { useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from './ui/Button';
import { WalletIcon, ArrowPathIcon, PowerIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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

  const formatAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

  const acceptedNetworks = [31337, 1337, 42];
  const isWrongNetwork = chainId !== null && !acceptedNetworks.includes(chainId);

  const networkNames: { [key: number]: string } = {
    31337: 'Anvil (Preferred)',
    1337: 'Localhost',
    42: 'Legacy Testnet',
  };

  const getNetworkStatus = () => {
    if (!chainId) return null;

    if (!isWrongNetwork) {
      return (
        <div className="rounded-lg border border-success/40 bg-[var(--success-bg)] p-3 text-center text-[var(--success-fg)]">
          <p className="flex items-center justify-center gap-2 text-xs">
            <CheckCircleIcon className="h-4 w-4" />
            Connected to {networkNames[chainId]} ({chainId})
          </p>
          {chainId !== 31337 && (
            <p className="mono-label mt-1 !tracking-[0.08em] text-warning">Chain 31337 preferred for Anvil</p>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-danger/40 bg-[var(--danger-bg)] p-3 text-center text-[var(--danger-fg)]">
        <p className="flex items-center justify-center gap-2 text-xs mb-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Wrong network detected
        </p>
        <p className="mono-label mb-3 !tracking-[0.08em]">Current {chainId} · supported {acceptedNetworks.join(', ')}</p>
        <Button onClick={switchToAnvilNetwork} variant="primary" size="sm">
          <ArrowPathIcon className="h-4 w-4" />
          Switch to RSK Testnet
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Network Status */}
      {isConnected && getNetworkStatus()}

      {/* Wallet Connection Status */}
      {isConnected && account ? (
        <div className="rounded-lg border border-border bg-surface p-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <p className="mono-label !tracking-[0.14em] text-text-secondary">Wallet connected</p>
          </div>
          <p className="break-all font-mono text-sm text-text-primary">{formatAddress(account)}</p>
          {chainId && <p className="mono-label mt-1 !tracking-[0.08em]">Chain ID {chainId}</p>}

          <div className="mt-4 flex gap-2">
            <Button onClick={disconnectWallet} variant="error" size="sm" className="flex-1">
              <PowerIcon className="h-4 w-4" />
              Disconnect
            </Button>
            {isWrongNetwork && (
              <Button onClick={switchToAnvilNetwork} variant="primary" size="sm" className="flex-1">
                <ArrowPathIcon className="h-4 w-4" />
                Switch
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button onClick={connectWallet} variant="primary" size="lg" className="w-full">
          <WalletIcon className="h-4 w-4" />
          Connect wallet to invest
        </Button>
      )}
    </div>
  );
};
