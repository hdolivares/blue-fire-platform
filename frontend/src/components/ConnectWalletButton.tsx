// In frontend/src/components/ConnectWalletButton.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

interface ConnectWalletButtonProps {
  onAccountChanged: (address: string | null) => void;
}

export const ConnectWalletButton = ({ onAccountChanged }: ConnectWalletButtonProps) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        onAccountChanged(address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        onAccountChanged(null);
      }
    } else {
      alert('Please install a browser wallet like MetaMask.');
    }
  };

  return (
    <div>
      {account ? (
        <div className="text-center p-3 rounded-lg bg-green-500/20 border border-green-500">
          <p className="text-sm">Wallet Connected:</p>
          <p className="font-mono text-sm break-all">{account}</p>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          // Changed text-black to text-blue-900
          className="w-full py-3 px-4 rounded-md bg-gradient-primary text-blue-900 font-bold transition-all hover:scale-105"
        >
          Connect Wallet to Invest
        </button>
      )}
    </div>
  );
};