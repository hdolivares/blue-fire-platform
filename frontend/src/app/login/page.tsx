import { LoginForm } from '@/components/LoginForm';
import { AuthShell } from '@/components/AuthShell';

export default function LoginPage() {
  return (
    <AuthShell kicker="ACCESS">
      <LoginForm />
    </AuthShell>
  );
}
