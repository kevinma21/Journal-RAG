'use client';

import { useActionState } from 'react';

import { initialResetPasswordState, resetPassword } from '@/app/(auth)/reset-password/actions';

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initialResetPasswordState);

  return (
    <form action={formAction} className="space-y-4">
      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-primary">
          New password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={state.errors?.password ? 'reset-password-error' : undefined}
          className="h-11 w-full rounded-md border border-border-subtle bg-bg-primary px-3.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary hover:border-border-focus/50 focus:border-border-focus focus:ring-2 focus:ring-brand-500/15"
        />

        {state.errors?.password && (
          <p id="reset-password-error" className="mt-1.5 text-xs text-error-500">
            {state.errors.password}
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-xs font-medium text-text-primary"
        >
          Confirm new password
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(state.errors?.confirmPassword)}
          aria-describedby={state.errors?.confirmPassword ? 'confirm-password-error' : undefined}
          className="h-11 w-full rounded-md border border-border-subtle bg-bg-primary px-3.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary hover:border-border-focus/50 focus:border-border-focus focus:ring-2 focus:ring-brand-500/15"
        />

        {state.errors?.confirmPassword && (
          <p id="confirm-password-error" className="mt-1.5 text-xs text-error-500">
            {state.errors.confirmPassword}
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
        className="flex h-11 w-full items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Updating password...' : 'Update password'}
      </button>
    </form>
  );
}
