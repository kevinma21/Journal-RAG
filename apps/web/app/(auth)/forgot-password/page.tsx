import Link from 'next/link';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />

          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Account recovery
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">
          Forgot your password?
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
          Enter the email address associated with your JournalPilot account and we&apos;ll send you
          a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-semibold text-brand-400 transition-colors hover:text-brand-300"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
