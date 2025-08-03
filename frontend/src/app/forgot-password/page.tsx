// In frontend/src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { API_URL } from '@/config/server';
import axios from 'axios';
import { StyledInput } from '@/components/StyledInput';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('Sending request...');
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error: Could not send reset link. Please try again.');
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <Card variant="frosted" className="w-full max-w-md p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-6">Forgot Password</h2>
        <p className="text-center text-secondary mb-6">Enter your email address and we will send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email">Email Address</label>
            <StyledInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
          >
            Send Reset Link
          </Button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        <p className="text-center text-sm pt-4">
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold hover:underline">Log In</Link>
        </p>
      </Card>
    </main>
  );
}