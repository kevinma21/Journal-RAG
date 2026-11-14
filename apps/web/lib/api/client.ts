import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('Missing NEXT_PUBLIC_API_URL');
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  const supabase = createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error('Unable to retrieve authentication session');
  }

  if (!session?.access_token) {
    throw new Error('User is not authenticated');
  }

  const headers = new Headers(options.headers);

  headers.set('Authorization', `Bearer ${session.access_token}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}