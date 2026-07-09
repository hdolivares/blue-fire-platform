'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { StyledInput } from './StyledInput';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import api from '@/lib/axios';

/**
 * @component RegistrationForm
 * @description A form for new users to create an account. Everyone self-registers
 * as an Investor; roles are assigned server-side (operators are provisioned via
 * the operator-request flow), so the client never sends a role.
 */
export const RegistrationForm = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  // Honeypot: bound to a hidden field that must stay empty. Bots that auto-fill
  // form inputs populate it and get rejected by the backend.
  const [website, setWebsite] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  /**
   * @function handleSubmit
   * @description Submits the registration form data to the backend.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setIsRegistering(true);
    const loadingToast = toast.loading('Creating your account...');

    const formData = {
      firstName,
      lastName,
      email: email.toLowerCase(), // Convert to lowercase for consistency
      password,
      country,
      website, // honeypot — normal users leave this empty
    };

    try {
      await api.post('/auth/register', formData);
      toast.dismiss(loadingToast);
      toast.success('Registration successful! Please log in.');
      router.push('/login'); // Redirect to login page after registration
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. The email may already be in use.';
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-md p-8 text-text-primary">
      <h2 className="display-caps text-3xl text-center mb-1">Create account</h2>
      <p className="serif-italic text-center text-text-secondary text-lg mb-6">
        join the loop
      </p>
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

        {/* Honeypot: off-screen and hidden from assistive tech, so no human fills
            it. Bots that blindly populate fields trip it and are rejected. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          disabled={isRegistering}
          variant="primary"
          size="lg"
          className="w-full mt-6"
        >
          {isRegistering ? 'Creating Account...' : 'Register'}
        </Button>

        <p className="text-center text-sm pt-4">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline">Log In</Link>
        </p>
      </form>
    </Card>
  );
};