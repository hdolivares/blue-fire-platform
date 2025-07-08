// In frontend/components/RegistrationForm.tsx
'use client';

import { useState } from 'react';
import axios from 'axios'; // Import axios

export const RegistrationForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  // For now, we'll manually set a mock wallet address
  const [walletAddress, setWalletAddress] = useState('0x1234567890ABCDEF');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { fullName, email, password, country, walletAddress };

    try {
      // Send the data to your backend API endpoint
      const response = await axios.post(
        'http://localhost:3001/investors/register',
        formData
      );

      console.log('Server Response:', response.data);
      alert('Registration successful!'); // Show a success message
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.'); // Show an error message
    }
  };

  return (
    <div className="card-frosted w-full max-w-md p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">Full Name</label>
          <input
            id="fullName" type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full bg-white/20 rounded-md border-transparent focus:border-white focus:ring-0"
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full bg-white/20 rounded-md border-transparent focus:border-white focus:ring-0"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full bg-white/20 rounded-md border-transparent focus:border-white focus:ring-0"
            required
          />
        </div>

        {/* Country Input */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium">Country</label>
          <input
            id="country" type="text" value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full bg-white/20 rounded-md border-transparent focus:border-white focus:ring-0"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6"
        >
          Register
        </button>
      </form>
    </div>
  );
};