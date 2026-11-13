'use client';

import { useActionState } from 'react';

import {
  initialSignUpState,
  signUp,
} from '@/app/(auth)/signup/actions';

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialSignUpState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.errors?.email}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={state.errors?.password}
        />

        <Field
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={state.errors?.confirmPassword}
        />
      </div>

      {state.message && (
        <div
          role={state.status === 'error' ? 'alert' : 'status'}
          className={[
            'rounded-lg border px-3 py-2.5 text-xs',
            state.status === 'error'
              ? 'border-[#FF4444]/20 bg-[#FF4444]/10 text-[#FF4444]'
              : 'border-[#22CC5E]/20 bg-[#22CC5E]/10 text-[#22CC5E]',
          ].join(' ')}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group relative flex h-11 w-full items-center justify-center rounded-lg bg-[#4F46E5] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>
          {pending ? 'Creating account...' : 'Create account'}
        </span>

        {!pending && (
          <span className="absolute right-4 transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        )}
      </button>
    </form>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  error?: string;
};

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  placeholder,
  error,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[#FDFDFD]"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11 w-full rounded-lg border border-white/[0.08] bg-[#1D1821] px-3.5 text-sm text-[#FDFDFD] outline-none transition duration-150 placeholder:text-[#737378] hover:border-white/[0.12] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
      />

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[#FF4444]">
          {error}
        </p>
      )}
    </div>
  );
}