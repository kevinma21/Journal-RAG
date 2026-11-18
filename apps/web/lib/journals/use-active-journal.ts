'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import type { Journal } from './types';

const ACTIVE_JOURNAL_KEY = 'journalpilot.activeJournalId';
const ACTIVE_JOURNAL_EVENT = 'journalpilot:active-journal-change';

function subscribeToActiveJournal(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(ACTIVE_JOURNAL_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(ACTIVE_JOURNAL_EVENT, onChange);
  };
}

function getStoredActiveJournalId() {
  try {
    return window.localStorage.getItem(ACTIVE_JOURNAL_KEY) ?? '';
  } catch {
    return '';
  }
}

function getServerActiveJournalId() {
  return '';
}

export function useActiveJournal(journals: Journal[]) {
  const [fallbackId, setFallbackId] = useState<string | null>(journals[0]?.id ?? null);
  const [hasSelectedInSession, setHasSelectedInSession] = useState(false);
  const storedId = useSyncExternalStore(
    subscribeToActiveJournal,
    getStoredActiveJournalId,
    getServerActiveJournalId,
  );

  const preferredId = hasSelectedInSession ? fallbackId : storedId || fallbackId;
  const activeId = journals.some((journal) => journal.id === preferredId)
    ? preferredId
    : (journals[0]?.id ?? null);

  const selectActiveJournal = useCallback((id: string | null) => {
    setFallbackId(id);
    setHasSelectedInSession(true);

    try {
      if (id) window.localStorage.setItem(ACTIVE_JOURNAL_KEY, id);
      else window.localStorage.removeItem(ACTIVE_JOURNAL_KEY);
      window.dispatchEvent(new Event(ACTIVE_JOURNAL_EVENT));
    } catch {
      // Keep the active selection usable for this visit when storage is unavailable.
    }
  }, []);

  return { activeId, selectActiveJournal };
}
