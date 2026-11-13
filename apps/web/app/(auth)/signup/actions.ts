'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/validation/auth';

export type SignUpState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  errors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export const initialSignUpState: SignUpState = {
  status: 'idle',
};

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
  });

  if (error) {
    return {
      status: 'error',
      message: 'We could not create your account. Please try again.',
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
    message: 'Your account has been created. Please check your email to confirm your account.',
  };
}
