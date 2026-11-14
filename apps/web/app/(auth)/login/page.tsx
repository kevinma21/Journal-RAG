import Link from 'next/link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { LoginForm } from '@/components/auth/login-form';

type LoginPageProps = {
  searchParams: Promise<{
    reset?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

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

      {params.reset === 'success' && (
        <div
          role="status"
          className="mb-5 rounded-md border border-success-500/20 bg-success-500/5 px-3 py-2.5 text-xs text-success-500"
        >
          Your password has been updated. You can now sign in.
        </div>
      )}

      <LoginForm />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
          Or
        </span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <GoogleSignInButton />

      <div className="mt-4 text-right">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-text-secondary transition-colors hover:text-brand-400"
        >
          Forgot password?
        </Link>
      </div>

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
