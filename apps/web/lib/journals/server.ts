import { createClient } from '@/lib/supabase/server';
import { getApiError } from './http-error';
import type { JournalLoadResult } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getInitialJournals(): Promise<JournalLoadResult> {
  if (!API_URL) {
    return {
      journals: [],
      error: 'The API URL is not configured. Set NEXT_PUBLIC_API_URL and restart the web app.',
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return { journals: [], error: 'Your session could not be read. Sign in again and retry.' };
    }

    const response = await fetch(`${API_URL.replace(/\/$/, '')}/v1/journals`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { journals: [], error: await getApiError(response) };
    }

    return { journals: (await response.json()) as JournalLoadResult['journals'], error: null };
  } catch (error) {
    return {
      journals: [],
      error:
        error instanceof Error && error.name === 'TimeoutError'
          ? 'The JournalPilot API took too long to respond. Check that it is running and retry.'
          : 'Could not reach the JournalPilot API. Check that the API is running, then retry.',
    };
  }
}
