'use client';

import { useActionState } from 'react';

import {
  initialLoginState,
  login,
} from '@/app/(auth)/login/actions';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    login,
    initialLoginState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium text-text-primary"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-invalid={Boolean(state.errors?.email)}
          className="h-11 w-full rounded-md border border-border-subtle bg-bg-primary px-3.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-brand-500/15"
        />

        {state.errors?.email && (
          <p className="mt-1.5 text-xs text-error-500">
            {state.errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-text-primary"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(state.errors?.password)}
          className="h-11 w-full rounded-md border border-border-subtle bg-bg-primary px-3.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-brand-500/15"
        />

        {state.errors?.password && (
          <p className="mt-1.5 text-xs text-error-500">
            {state.errors.password}
          </p>
        )}
      </div>

      {state.message && (
        <div
          role="alert"
          className="rounded-md border border-error-500/20 bg-error-500/5 px-3 py-2.5 text-xs text-error-500"
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group relative flex h-11 w-full items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{pending ? 'Signing in...' : 'Sign in'}</span>

        {!pending && (
          <span
            aria-hidden="true"
            className="absolute right-4 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        )}
      </button>
    </form>
  );
}