'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { resetPasswordSchema } from '@/lib/validation/auth';
import type { ResetPasswordState } from './state';

export async function resetPassword(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const result = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!result.success) {
    const errors: ResetPasswordState['errors'] = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (field === 'password' || field === 'confirmPassword') {
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

  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (error) {
    return {
      status: 'error',
      message: 'Unable to update your password. Please try again.',
    };
  }

  redirect('/login?reset=success');
}
