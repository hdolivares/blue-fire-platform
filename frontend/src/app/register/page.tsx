import { RegistrationForm } from '@/components/RegistrationForm';
import { AuthShell } from '@/components/AuthShell';

export default function RegisterPage() {
  return (
    <AuthShell kicker="CREATE ACCOUNT">
      <RegistrationForm />
    </AuthShell>
  );
}
