'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validation/auth';
import type { LoginState } from './state';

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    const errors: LoginState['errors'] = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (field === 'email' || field === 'password') {
        errors[field] ??= issue.message;
      }
    }

    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      errors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    // Keep credentials and email out of logs while retaining a useful reason
    // for diagnosing Auth configuration and account-state failures.
    console.warn('Supabase password sign-in failed', {
      code: error.code ?? 'unknown',
      status: error.status ?? null,
    });

    const message =
      error.status === 429 ||
      error.code === 'over_request_rate_limit' ||
      error.code === 'over_email_send_rate_limit'
        ? 'Too many sign-in requests. Wait a few minutes, then try again.'
        : 'Unable to sign in. Check your email and password.';

    return {
      status: 'error',
      message,
    };
  }

  redirect('/');
}
