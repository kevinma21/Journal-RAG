import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />

          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Welcome back
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">
          Welcome back.
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
          Continue exploring your personal memory with JournalPilot.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-brand-400 transition-colors hover:text-brand-300"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}