import Link from 'next/link';

import { SignUpForm } from '@/components/auth/sign-up-form';

export default function SignupPage() {
  return (
    <div className="w-full text-auth-text">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />

          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-auth-text-secondary">
            Begin your journey
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          Start remembering.
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-auth-text-secondary">
          Create your personal space for the moments, ideas, and experiences
          you want to remember.
        </p>
      </div>

      {/* Form */}
      <SignUpForm />

      {/* Login */}
      <p className="mt-6 text-center text-sm text-auth-text-secondary">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-brand-500 transition-colors hover:text-brand-600"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}