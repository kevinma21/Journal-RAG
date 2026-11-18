import { NextResponse, type NextRequest } from 'next/server';

import { getSupportedEmailOtpType } from '@/lib/supabase/auth-otp';
import { createClient } from '@/lib/supabase/server';
import { getSafeInternalRedirect } from '@/lib/supabase/redirect';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = getSupportedEmailOtpType(requestUrl.searchParams.get('type'));

  const defaultNext = type === 'recovery' ? '/reset-password' : '/';
  const next = getSafeInternalRedirect(requestUrl.searchParams.get('next'), defaultNext);

  if (!tokenHash || tokenHash.length > 512 || !type) {
    return NextResponse.redirect(
      new URL('/forgot-password?error=invalid-link', requestUrl.origin),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(
      new URL('/forgot-password?error=invalid-link', requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
