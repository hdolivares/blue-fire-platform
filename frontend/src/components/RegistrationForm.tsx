// In frontend/components/RegistrationForm.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { StyledInput } from './StyledInput'; // Import our new component

export const RegistrationForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [walletAddress, setWalletAddress] = useState('0x1234567890ABCDEF');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { fullName, email, password, country, walletAddress };

    try {
      const response = await axios.post(
        'http://localhost:3001/investors/register',
        formData
      );
      console.log('Server Response:', response.data);
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="card-frosted w-full max-w-md p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">Full Name</label>
          <StyledInput id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
          <StyledInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <StyledInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        {/* Country Input */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium">Country</label>
          <StyledInput id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6 transition-all duration-300 hover:brightness-110 hover:scale-105"
        >
          Register
        </button>
      </form>
    </div>
  );
};