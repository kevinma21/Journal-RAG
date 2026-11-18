import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .max(254, 'Email address must be 254 characters or fewer.')
  .pipe(z.email('Please enter a valid email address.'));

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(256, 'Password must be 256 characters or fewer.');

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .max(256, 'Password must be 256 characters or fewer.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password do not match.',
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .max(256, 'Password must be 256 characters or fewer.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type logininput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
