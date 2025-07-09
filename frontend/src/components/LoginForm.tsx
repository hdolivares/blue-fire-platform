'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { StyledInput } from './StyledInput';
import Link from 'next/link';

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      });
      const { access_token, user } = response.data;
      
      login(access_token);
      
      alert('Login successful!');

      if (user.roles.includes('Admin')) {
        router.push('/admin/dashboard');
      } else if (user.roles.includes('Operator')) {
        router.push('/operator/dashboard'); 
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="card-frosted w-full max-w-md p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
          <StyledInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <StyledInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6 transition-all hover:brightness-110"
        >
          Log In
        </button>

        <p className="text-center text-sm pt-4">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
};