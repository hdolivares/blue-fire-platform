'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Listbox } from '@headlessui/react';
import toast from 'react-hot-toast'; // 1. Import toast
import { ethers } from 'ethers';

import { StyledInput } from './StyledInput';
import { GlowingButton } from './GlowingButton';

// The available roles for selection.
const roles = ['Investor', 'Operator'];

/**
 * @component RegistrationForm
 * @description A form for new users to create an account with a specific role.
 */
export const RegistrationForm = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [isRegistering, setIsRegistering] = useState(false);

  /**
   * @function connectWallet
   * @description Connects to the user's browser wallet and sets the address state.
   */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWalletAddress(await signer.getAddress());
        toast.success("Wallet connected successfully!");
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast.error("Failed to connect wallet.");
      }
    } else {
      toast.error('Please install a browser wallet like MetaMask.');
    }
  };

  /**
   * @function handleSubmit
   * @description Submits the registration form data to the backend.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!walletAddress) {
      return toast.error("Please connect your wallet to register.");
    }
    
    setIsRegistering(true);
    const loadingToast = toast.loading('Creating your account...');

    const formData = { 
      firstName,
      lastName,
      email, 
      password, 
      country, 
      walletAddress,
      roles: [selectedRole],
    };

    try {
      await axios.post('http://localhost:3001/auth/register', formData);
      toast.dismiss(loadingToast);
      toast.success('Registration successful! Please log in.');
      router.push('/login'); // Redirect to login page after registration
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Registration failed:', error);
      toast.error('Registration failed. The email or wallet may already be in use.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="card-frosted w-full max-w-md p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="firstName">First Name</label>
            <StyledInput id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="flex-1">
            <label htmlFor="lastName">Last Name</label>
            <StyledInput id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div>
          <label htmlFor="email">Email Address</label>
          <StyledInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <StyledInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="country">Country</label>
          <StyledInput id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">I am an</label>
          <Listbox value={selectedRole} onChange={setSelectedRole}>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white/20 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-white/75 sm:text-sm">
                <span className="block truncate">{selectedRole}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-400" aria-hidden="true"><path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                {roles.map((role, roleIdx) => (
                  <Listbox.Option
                    key={roleIdx}
                    className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-purple-500/50 text-white' : 'text-gray-900'}`}
                    value={role}
                  >
                    {({ selected }) => <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{role}</span>}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div className="pt-2">
          {walletAddress ? (
            <div className="text-center p-3 rounded-lg bg-green-500/20 border border-green-500">
              <p className="text-sm">Wallet Connected:</p>
              <p className="font-mono text-xs break-all">{walletAddress}</p>
            </div>
          ) : (
            <GlowingButton onClick={connectWallet}>
              Connect Wallet
            </GlowingButton>
          )}
        </div>

        <button
          type="submit"
          disabled={!walletAddress || isRegistering}
          className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? 'Creating Account...' : 'Register'}
        </button>

        <p className="text-center text-sm pt-4">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline">Log In</Link>
        </p>
      </form>
    </div>
  );
};