'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StyledInput } from './StyledInput';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export const LoginForm = () => {
  const router = useRouter();
  const { login, setIsLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase(), // Convert to lowercase for consistency
        password,
      });
      
      const { access_token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Update auth context
      login(access_token);
      
      toast.success('Logged in successfully!');
      
      // Redirect based on user role
      if (user.roles.includes('Admin')) {
        router.push('/admin/dashboard');
      } else if (user.roles.includes('Operator')) {
        router.push('/operator/dashboard'); 
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
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
          <div className="text-right mt-2">
            <Link href="/forgot-password" className="text-sm font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>
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