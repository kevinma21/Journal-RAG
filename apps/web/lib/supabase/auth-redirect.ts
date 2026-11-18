export function getAuthCallbackUrl(next = '/') {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined);

  if (!siteUrl) {
    throw new Error('Missing NEXT_PUBLIC_SITE_URL');
  }

  const callbackUrl = new URL('/auth/callback', siteUrl);
  callbackUrl.searchParams.set('next', next);

  return callbackUrl.toString();
}
