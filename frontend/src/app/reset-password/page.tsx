// In frontend/src/app/reset-password/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/config/server';
import axios from 'axios';
import { StyledInput } from '@/components/StyledInput';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid password reset link.');
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!token) {
      setMessage('No reset token found. Please request a new link.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      alert('Password reset successfully! Redirecting to login...');
      router.push('/login');
    } catch (error) {
      setMessage('Failed to reset password. The link may be invalid or expired.');
      console.error(error);
    }
  };

  return (
    <Card variant="frosted" className="w-full max-w-md p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword">New Password</label>
          <StyledInput id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <StyledInput id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <Button
          type="submit"
          disabled={!token}
          variant="primary"
          size="lg"
          className="w-full mt-6"
        >
          Reset Password
        </Button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </Card>
  );
}

// A small wrapper is needed for Suspense with Client Components
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="min-h-screen w-full flex items-center justify-center p-4">
        <ResetPasswordForm />
      </main>
    </Suspense>
  )
}