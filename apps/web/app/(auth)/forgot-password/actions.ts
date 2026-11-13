'use server';

import { forgotPasswordSchema } from '@/lib/validation/auth';
import { createClient } from '@/lib/supabase/server';

export type ForgotPasswordState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  errors?: {
    email?: string;
  };
};

export const initialForgotPasswordState: ForgotPasswordState = {
  status: 'idle',
};

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

  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email);

  if (error) {
    return {
      status: 'error',
      message: 'Unable to process your request. Please try again.',
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
