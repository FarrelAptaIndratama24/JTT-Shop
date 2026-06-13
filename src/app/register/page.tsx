import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account — JTT Shop',
  description: 'Register a new JTT Shop account and start shopping premium billiard gear.',
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <RegisterForm />
    </main>
  );
}
