import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

const DEFAULT_NEXT = '/reset-password';

function getSafeNext(value: string | null) {
  if (!value) {
    return DEFAULT_NEXT;
  }

  /*
   * Only allow internal paths.
   *
   * This prevents the `next` parameter from becoming
   * an open redirect.
   */
  if (!value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_NEXT;
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;

  const next = getSafeNext(requestUrl.searchParams.get('next'));

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/forgot-password?error=invalid-link', requestUrl.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(new URL('/forgot-password?error=invalid-link', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
