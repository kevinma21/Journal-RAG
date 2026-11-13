'use client';

import { useActionState } from 'react';

import {
  initialForgotPasswordState,
  requestPasswordReset,
} from '@/app/(auth)/forgot-password/actions';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialForgotPasswordState,
  );

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
          aria-describedby={state.errors?.email ? 'forgot-password-email-error' : undefined}
          className="h-11 w-full rounded-md border border-border-subtle bg-bg-primary px-3.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary hover:border-border-focus/50 focus:border-border-focus focus:ring-2 focus:ring-brand-500/15"
        />

        {state.errors?.email && (
          <p id="forgot-password-email-error" className="mt-1.5 text-xs text-error-500">
            {state.errors.email}
          </p>
        )}
      </div>

      {state.message && (
        <div
          role={state.status === 'error' ? 'alert' : 'status'}
          className={[
            'rounded-md border px-3 py-2.5 text-xs',
            state.status === 'error'
              ? 'border-error-500/20 bg-error-500/5 text-error-500'
              : 'border-success-500/20 bg-success-500/5 text-success-500',
          ].join(' ')}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Sending link...' : 'Send reset link'}
      </button>
    </form>
  );
}
