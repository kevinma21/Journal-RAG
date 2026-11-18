'use server';

import { forgotPasswordSchema } from '@/lib/validation/auth';
import { createClient } from '@/lib/supabase/server';
import { getAuthCallbackUrl } from '@/lib/supabase/auth-redirect';
import type { ForgotPasswordState } from './state';

export async function requestPasswordReset(
  _previousState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!result.success) {
    const emailIssue = result.error.issues.find((issue) => issue.path[0] === 'email');

    return {
      status: 'error',
      message: 'Please correct the highlighted field.',
      errors: {
        email: emailIssue?.message,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: getAuthCallbackUrl('/reset-password'),
  });

  if (error) {
    console.warn('Supabase password reset request failed', {
      code: error.code ?? 'unknown',
      status: error.status ?? null,
    });

    const message =
      error.code === 'email_address_not_authorized'
        ? 'Supabase email is not configured to send to this address. Configure custom SMTP in your Supabase project.'
        : error.code === 'over_email_send_rate_limit'
          ? 'Too many reset emails were requested. Wait before trying again.'
          : error.code === 'redirect_to_not_allowed'
            ? 'The reset link URL is not allowed by Supabase. Add the local callback URL to Auth URL Configuration.'
            : 'Unable to process your request. Please try again.';

    return {
      status: 'error',
      message,
    };
  }

  /*
   * Deliberately do not tell the user whether the email exists.
   *
   * Supabase's resetPasswordForEmail() does not reveal whether
   * an account exists, which helps prevent user enumeration.
   */
  return {
    status: 'success',
    message: 'If an account exists for that email, you will receive a password reset link shortly.',
  };
}
