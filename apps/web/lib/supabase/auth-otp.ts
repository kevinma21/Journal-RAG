import type { EmailOtpType } from '@supabase/supabase-js';

const supportedOtpTypes = ['signup', 'email', 'recovery'] as const satisfies readonly EmailOtpType[];

export function getSupportedEmailOtpType(value: string | null): EmailOtpType | null {
  return supportedOtpTypes.find((supportedType) => supportedType === value) ?? null;
}
