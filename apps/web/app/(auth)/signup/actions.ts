'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/validation/auth';
import { getAuthCallbackUrl } from '@/lib/supabase/auth-redirect';
import type { SignUpState } from './state';

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const input = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const result = signUpSchema.safeParse(input);

  if (!result.success) {
    const errors: SignUpState['errors'] = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (field === 'email' || field === 'password' || field === 'confirmPassword') {
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

  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo: getAuthCallbackUrl('/'),
    },
  });

  if (error) {
    // Keep credentials and email out of logs while retaining a useful reason
    // for diagnosing Auth configuration and account-state failures.
    console.warn('Supabase sign-up failed', {
      code: error.code ?? 'unknown',
      status: error.status ?? null,
    });

    const message =
      error.status === 429 ||
      error.code === 'over_request_rate_limit' ||
      error.code === 'over_email_send_rate_limit'
        ? 'Too many sign-up attempts. Please wait a few minutes and try again.'
        : error.code === 'weak_password'
          ? 'Choose a stronger password and try again.'
          : error.code === 'email_address_invalid'
            ? 'Enter a valid email address and try again.'
            : 'Unable to create your account. Please check your details and try again.';

    return {
      status: 'error',
      message,
    };
  }

  // If email confirmation is disabled, Supabase can return a session
  // immediately. In that case the user is already authenticated.
  if (data.session) {
    redirect('/');
  }

  // Email confirmation is enabled.
  return {
    status: 'success',
    message:
      'Please confirm your email. The link will sign you in and take you to your journal.',
  };
}
