'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validation/auth';

export type LoginState = {
  status: 'idle' | 'error';
  message?: string;
  errors?: {
    email?: string;
    password?: string;
  };
};

export const initialLoginState: LoginState = {
  status: 'idle',
};

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
    return {
      status: 'error',
      message: 'Unable to sign in. Check your email and password.',
    };
  }

  redirect('/');
}
