'use client';

import { useActionState } from 'react';
import { useEffect, useState } from 'react';

import { login } from '@/app/(auth)/login/actions';
import { initialLoginState } from '@/app/(auth)/login/state';
import { PasswordInput } from './password-input';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialLoginState);
  const [authLinkMessage, setAuthLinkMessage] = useState<string>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const errorCode = params.get('error_code');

    if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
      setAuthLinkMessage(
        'This email link has expired or was already used. Request a new link and open the latest email.',
      );
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  const message = state.message ?? authLinkMessage;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-text-primary">
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
          <p className="mt-1.5 text-xs text-error-500">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-primary">
          Password
        </label>

        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(state.errors?.password)}
          className="h-11 w-full rounded-md border border-border-subtle bg-bg-primary px-3.5 pr-11 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-brand-500/15"
        />

        {state.errors?.password && (
          <p className="mt-1.5 text-xs text-error-500">{state.errors.password}</p>
        )}
      </div>

      {message && (
        <div
          role="alert"
          className="rounded-md border border-error-500/20 bg-error-500/5 px-3 py-2.5 text-xs text-error-500"
        >
          {message}
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
