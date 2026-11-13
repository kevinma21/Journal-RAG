import { z } from 'zod';

export const signUpSchema = z
  .object({
    email: z.string().trim().pipe(z.email('Please enter a valid email address.')),
    password: z.string().min(8, 'Password must be at least 8 chracters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password do not match.',
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
