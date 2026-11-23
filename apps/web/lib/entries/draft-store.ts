import type { EntryDraft } from './types';

export function entryDraftKey(journalId: string, entryId: string | null) {
  return `journalpilot.entryDraft.${journalId}.${entryId ?? 'new'}`;
}

export function readDraft(key: string) {
  try {
    const snapshot = window.localStorage.getItem(key);
    if (!snapshot) return null;
    const value = JSON.parse(snapshot) as Partial<EntryDraft>;

    if (
      typeof value.title !== 'string' ||
      typeof value.content !== 'string' ||
      typeof value.occurredAt !== 'string' ||
      typeof value.savedAt !== 'string'
    ) {
      return null;
    }

    const { draftId, baseRevision, attachments } = value;
    return {
      title: value.title,
      content: value.content,
      occurredAt: value.occurredAt,
      savedAt: value.savedAt,
      draftId: typeof draftId === 'string' ? draftId : undefined,
      baseRevision: Number.isInteger(baseRevision) ? baseRevision : undefined,
      attachments:
        Array.isArray(attachments?.ids) &&
        attachments.ids.every((id) => typeof id === 'string') &&
        Array.isArray(attachments.stagedIds) &&
        attachments.stagedIds.every((id) => typeof id === 'string')
          ? attachments
          : undefined,
    };
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: Omit<EntryDraft, 'savedAt'>) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...draft, savedAt: new Date().toISOString() } satisfies EntryDraft),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Persistence has succeeded on the server even if local cleanup is unavailable.
  }
}
