import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from './auth.js';
import { getSupportedEmailOtpType } from '../supabase/auth-otp.js';
import { getSafeInternalRedirect } from '../supabase/redirect.js';
import { describe, expect, it } from 'vitest';

describe('Phase 1 authentication input validation', () => {
  it('rejects malformed and overlong email addresses', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: `${'a'.repeat(250)}@example.com` }).success).toBe(false);
  });

  it('enforces password length limits on signup and reset', () => {
    expect(
      signUpSchema.safeParse({
        email: 'member@example.com',
        password: 'short',
        confirmPassword: 'short',
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        password: 'a'.repeat(257),
        confirmPassword: 'a'.repeat(257),
      }).success,
    ).toBe(false);
  });

  it('rejects mismatched signup and reset passwords', () => {
    expect(
      signUpSchema.safeParse({
        email: 'member@example.com',
        password: 'correct-horse-battery',
        confirmPassword: 'different-password',
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        password: 'correct-horse-battery',
        confirmPassword: 'different-password',
      }).success,
    ).toBe(false);
  });

  it('accepts valid login input without applying signup-only password rules', () => {
    expect(
      loginSchema.safeParse({
        email: 'member@example.com',
        password: 'Existing8',
      }).success,
    ).toBe(true);
  });

  it('accepts only OTP types used by the email confirmation and recovery flow', () => {
    expect(getSupportedEmailOtpType('signup')).toBe('signup');
    expect(getSupportedEmailOtpType('recovery')).toBe('recovery');
    expect(getSupportedEmailOtpType('unexpected')).toBeNull();
    expect(getSupportedEmailOtpType(null)).toBeNull();
  });

  it('rejects external and malformed post-auth redirects', () => {
    expect(getSafeInternalRedirect('https://attacker.example')).toBe('/');
    expect(getSafeInternalRedirect('//attacker.example')).toBe('/');
    expect(getSafeInternalRedirect('/journal?view=recent')).toBe('/journal?view=recent');
  });
});
