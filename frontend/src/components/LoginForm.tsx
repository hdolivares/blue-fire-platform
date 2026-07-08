'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StyledInput } from './StyledInput';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

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
    <Card variant="elevated" className="w-full max-w-md p-8 text-text-primary">
      <h2 className="display-caps text-3xl text-center mb-1">Log in</h2>
      <p className="serif-italic text-center text-text-secondary text-lg mb-6">
        welcome back to the loop
      </p>
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
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-6"
        >
          Log In
        </Button>

        <p className="text-center text-sm pt-4">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold hover:underline">Register</Link>
        </p>
      </form>
    </Card>
  );
};