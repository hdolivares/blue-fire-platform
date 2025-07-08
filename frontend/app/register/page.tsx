// In frontend/app/register/page.tsx
import { RegistrationForm } from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-secondary p-4">
      <RegistrationForm />
    </main>
  );
}