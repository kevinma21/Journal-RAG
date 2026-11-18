import { createClient } from '@/lib/supabase/server';
import { getApiError } from '@/lib/journals/http-error';
import type { Journal } from '@/lib/journals/types';
import type { EntryPage, JournalEntry, JournalWorkspaceResult } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const EMPTY_PAGINATION = { page: 1, limit: 25, total: 0, totalPages: 0 };

export async function getInitialJournalWorkspace(
  journalId: string,
): Promise<JournalWorkspaceResult> {
  if (!API_URL) {
    return {
      journal: null,
      entries: [],
      pagination: EMPTY_PAGINATION,
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
      return {
        journal: null,
        entries: [],
        pagination: EMPTY_PAGINATION,
        error: 'Your session could not be read. Sign in again and retry.',
      };
    }

    const headers = { Authorization: `Bearer ${session.access_token}` };
    const baseUrl = API_URL.replace(/\/$/, '');
    const journalResponse = await fetch(`${baseUrl}/v1/journals`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!journalResponse.ok) {
      return {
        journal: null,
        entries: [],
        pagination: EMPTY_PAGINATION,
        error: await getApiError(journalResponse),
      };
    }

    const journals = (await journalResponse.json()) as Journal[];
    const journal = journals.find((item) => item.id === journalId) ?? null;
    if (!journal) {
      return {
        journal: null,
        entries: [],
        pagination: EMPTY_PAGINATION,
        error: 'This journal could not be found.',
      };
    }

    const entriesResponse = await fetch(
      `${baseUrl}/v1/entries?${new URLSearchParams({ journalId, page: '1', limit: '25' })}`,
      {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!entriesResponse.ok) {
      return {
        journal,
        entries: [],
        pagination: EMPTY_PAGINATION,
        error: await getApiError(entriesResponse),
      };
    }

    const result = (await entriesResponse.json()) as EntryPage;
    return {
      journal,
      entries: result.data as JournalEntry[],
      pagination: result.meta.pagination,
      error: null,
    };
  } catch (error) {
    return {
      journal: null,
      entries: [],
      pagination: EMPTY_PAGINATION,
      error:
        error instanceof Error && error.name === 'TimeoutError'
          ? 'The JournalPilot API took too long to respond. Check that it is running and retry.'
          : 'Could not reach the JournalPilot API. Check that the API is running, then retry.',
    };
  }
}
