// In frontend/src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { StyledInput } from '@/components/StyledInput';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('Sending request...');
    try {
      const response = await axios.post('http://localhost:3001/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error: Could not send reset link. Please try again.');
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="card-frosted w-full max-w-md p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-6">Forgot Password</h2>
        <p className="text-center text-gray-300 mb-6">Enter your email address and we will send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email">Email Address</label>
            <StyledInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md bg-gradient-accent text-white font-bold mt-6 transition-all hover:brightness-110"
          >
            Send Reset Link
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        <p className="text-center text-sm pt-4">
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold hover:underline">Log In</Link>
        </p>
      </div>
    </main>
  );
}