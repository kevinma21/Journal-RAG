'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ArrowLeft, CalendarDays, LoaderCircle, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { apiFetch } from '@/lib/api/client';
import { getApiError, getNetworkError } from '@/lib/journals/http-error';
import type { Journal } from '@/lib/journals/types';
import { clearDraft, entryDraftKey, readDraft, saveDraft } from '@/lib/entries/draft-store';
import type {
  EntryFormValues,
  EntryPage,
  EntryPagination,
  JournalEntry,
} from '@/lib/entries/types';
import { EntryEditor } from './entry-editor';
import { EntryReader } from './entry-reader';
import { EntryTimeline } from './entry-timeline';

type Props = {
  journal: Journal;
  initialEntries: JournalEntry[];
  initialPagination: EntryPagination;
  initialError: string | null;
};

type View = 'reader' | 'editor' | 'empty';
function localDateTime(value = new Date()) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromEntry(entry: JournalEntry): EntryFormValues {
  return {
    title: entry.title ?? '',
    content: entry.content,
    occurredAt: localDateTime(new Date(entry.occurredAt)),
  };
}

export function JournalWorkspace({
  journal,
  initialEntries,
  initialPagination,
  initialError,
}: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [pagination, setPagination] = useState(initialPagination);
  const [selected, setSelected] = useState<JournalEntry | null>(initialEntries[0] ?? null);
  const [view, setView] = useState<View>(initialEntries.length ? 'reader' : 'empty');
  const [isTrash, setIsTrash] = useState(false);
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState<EntryFormValues>({ title: '', content: '', occurredAt: '' });
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [localDraftAvailable, setLocalDraftAvailable] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const filterKey = `${query}\u0000${from}\u0000${to}\u0000${page}\u0000${isTrash}`;
  const previousFilterKey = useRef(filterKey);

  const draftKey = useMemo(
    () => entryDraftKey(journal.id, view === 'editor' ? (selected?.id ?? null) : null),
    [journal.id, selected?.id, view],
  );

  const loadEntries = useCallback(
    async (nextPage = page, trash = isTrash) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams({ page: String(nextPage), limit: '25' });
        if (query.trim()) params.set('q', query.trim());
        if (trash) params.set('journalId', journal.id);
        else {
          params.set('journalId', journal.id);
          if (from) params.set('from', from);
          if (to) params.set('to', to);
        }
        const response = await apiFetch(`/v1/entries/${trash ? 'trash' : ''}?${params}`, {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(await getApiError(response));
        const result = (await response.json()) as EntryPage;
        setEntries(result.data);
        setPagination(result.meta.pagination);
        setPage(result.meta.pagination.page);
        setSelected(
          (current) =>
            result.data.find((entry) => entry.id === current?.id) ?? result.data[0] ?? null,
        );
        if (!result.data.length) setView('empty');
        else setView((current) => (current === 'editor' ? current : 'reader'));
      } catch (error) {
        setLoadError(getNetworkError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [from, isTrash, journal.id, page, query, to],
  );

  // Only reload when the user changes a filter or the trash view; initial data is server rendered.
  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    const timeout = window.setTimeout(() => void loadEntries(page, isTrash), query ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [filterKey, isTrash, loadEntries, page, query]);

  function updateValues(nextValues: EntryFormValues) {
    setValues(nextValues);
    setLocalDraftAvailable(false);
    setHasLocalDraft(saveDraft(draftKey, nextValues));
  }

  function beginNew() {
    const key = entryDraftKey(journal.id, null);
    const stored = readDraft(key);
    const initialValues = stored
      ? { title: stored.title, content: stored.content, occurredAt: stored.occurredAt }
      : { title: '', content: '', occurredAt: localDateTime() };
    setSelected(null);
    setValues(initialValues);
    setHasLocalDraft(Boolean(stored));
    setLocalDraftAvailable(Boolean(stored));
    setSaveError(null);
    setView('editor');
  }

  function beginEdit(entry: JournalEntry) {
    const key = entryDraftKey(journal.id, entry.id);
    const stored = readDraft(key);
    const isNewerDraft = Boolean(stored && stored.savedAt > entry.updatedAt);
    setSelected(entry);
    setValues(
      isNewerDraft && stored
        ? { title: stored.title, content: stored.content, occurredAt: stored.occurredAt }
        : fromEntry(entry),
    );
    setHasLocalDraft(isNewerDraft);
    setLocalDraftAvailable(isNewerDraft);
    setSaveError(null);
    setView('editor');
  }

  function selectEntry(entry: JournalEntry) {
    setSelected(entry);
    setView('reader');
    setActionError(null);
  }

  async function saveEntry() {
    setIsSaving(true);
    setSaveError(null);
    try {
      const editing = Boolean(selected && !isTrash);
      const path = editing ? `/v1/entries/${selected!.id}` : '/v1/entries';
      const response = await apiFetch(path, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({
          journalId: journal.id,
          title: values.title.trim() || null,
          content: values.content,
          occurredAt: new Date(values.occurredAt).toISOString(),
        }),
      });
      if (!response.ok) throw new Error(await getApiError(response));
      const result = (await response.json()) as { data: JournalEntry };
      clearDraft(draftKey);
      setHasLocalDraft(false);
      setLocalDraftAvailable(false);
      await loadEntries(1, false);
      setSelected(result.data);
      setView('reader');
    } catch (error) {
      setSaveError(getNetworkError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function mutateEntry(path: string, method: string, confirmText?: string) {
    if (!selected) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setActionError(null);
    try {
      const response = await apiFetch(path, { method });
      if (!response.ok) throw new Error(await getApiError(response));
      setSelected(null);
      await loadEntries(1, isTrash);
    } catch (error) {
      setActionError(getNetworkError(error));
    }
  }

  async function changeTrash(nextTrash: boolean) {
    setIsTrash(nextTrash);
    setPage(1);
    setQuery('');
    setFrom('');
    setTo('');
    setSelected(null);
    setView('empty');
  }

  return (
    <section className="mx-auto flex h-[calc(100dvh-7.25rem)] min-h-[540px] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary shadow-xl md:h-[calc(100dvh-6.75rem)]">
      <header className="flex shrink-0 items-center justify-between border-b border-border-muted px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Back to journals"
            className="flex size-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft size={17} />
          </Link>
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
            <CalendarDays size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-tertiary">Journal</p>
            <h1 className="truncate text-sm font-semibold text-text-primary">{journal.name}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={beginNew}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus size={16} /> <span className="hidden sm:inline">New entry</span>
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex w-full shrink-0 flex-col border-r border-border-muted md:w-[340px] lg:w-[360px] ${view !== 'empty' ? 'hidden md:flex' : 'flex'}`}
        >
          <div className="space-y-3 border-b border-border-muted p-4">
            <nav
              className="grid grid-cols-2 gap-1 rounded-lg bg-bg-base p-1"
              aria-label="Entry views"
            >
              <button
                type="button"
                onClick={() => void changeTrash(false)}
                aria-pressed={!isTrash}
                className={`flex h-8 items-center justify-center gap-2 rounded-md text-xs font-medium ${!isTrash ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                <Archive size={14} /> Entries
              </button>
              <button
                type="button"
                onClick={() => void changeTrash(true)}
                aria-pressed={isTrash}
                className={`flex h-8 items-center justify-center gap-2 rounded-md text-xs font-medium ${isTrash ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                <Trash2 size={14} /> Recently Deleted
              </button>
            </nav>
            <label className="flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-bg-base px-3 text-text-tertiary focus-within:border-border-focus">
              <Search size={15} />
              <span className="sr-only">Search entries</span>
              <input
                value={query}
                onChange={(event) => {
                  setPage(1);
                  setQuery(event.target.value);
                }}
                placeholder="Search entries"
                className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </label>
            {!isTrash && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-text-tertiary">
                  From
                  <input
                    aria-label="Filter from date"
                    type="date"
                    value={from}
                    onChange={(event) => {
                      setPage(1);
                      setFrom(event.target.value);
                    }}
                    className="mt-1 w-full rounded-md border border-border-subtle bg-bg-base px-2 py-1.5 text-xs text-text-secondary"
                  />
                </label>
                <label className="text-[11px] text-text-tertiary">
                  To
                  <input
                    aria-label="Filter to date"
                    type="date"
                    value={to}
                    onChange={(event) => {
                      setPage(1);
                      setTo(event.target.value);
                    }}
                    className="mt-1 w-full rounded-md border border-border-subtle bg-bg-base px-2 py-1.5 text-xs text-text-secondary"
                  />
                </label>
              </div>
            )}
          </div>
          {loadError ? (
            <div
              className="m-4 rounded-lg border border-error-500/30 bg-error-500/10 p-3 text-sm text-text-secondary"
              role="alert"
            >
              {loadError}
              <button
                type="button"
                onClick={() => void loadEntries(1)}
                className="ml-2 font-semibold text-brand-300"
              >
                Retry
              </button>
            </div>
          ) : null}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-text-tertiary">
              <LoaderCircle size={14} className="animate-spin" /> Loading entries
            </div>
          )}
          {actionError && (
            <p role="alert" className="px-4 py-2 text-xs text-error-500">
              {actionError}
            </p>
          )}
          <EntryTimeline
            entries={entries}
            selectedId={selected?.id ?? null}
            pagination={pagination}
            isTrash={isTrash}
            onSelect={selectEntry}
            onNewEntry={beginNew}
            onPageChange={setPage}
          />
        </aside>
        <main className={`min-w-0 flex-1 ${view === 'empty' ? 'hidden md:flex' : 'flex'}`}>
          {view === 'editor' ? (
            <EntryEditor
              entry={selected}
              values={values}
              hasLocalDraft={hasLocalDraft}
              localDraftAvailable={localDraftAvailable}
              isSaving={isSaving}
              error={saveError}
              onValuesChange={updateValues}
              onSave={saveEntry}
              onCancel={() => (selected ? setView('reader') : setView('empty'))}
              onBackToList={() => setView('empty')}
            />
          ) : view === 'reader' && selected ? (
            <EntryReader
              entry={selected}
              isTrash={isTrash}
              onEdit={() => beginEdit(selected)}
              onMoveToTrash={() =>
                void mutateEntry(
                  `/v1/entries/${selected.id}`,
                  'DELETE',
                  'Move this entry to Recently Deleted? You can restore it later.',
                )
              }
              onRestore={() => void mutateEntry(`/v1/entries/${selected.id}/restore`, 'POST')}
              onPermanentlyDelete={() =>
                void mutateEntry(
                  `/v1/entries/${selected.id}/permanent`,
                  'DELETE',
                  'Permanently delete this entry? This cannot be undone.',
                )
              }
              onBackToList={() => setView('empty')}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-bg-secondary text-brand-300">
                <Archive size={21} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                {isTrash ? 'Recently Deleted' : 'Your journal is ready'}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                {isTrash
                  ? 'Deleted entries will appear here.'
                  : 'Choose an entry to read, or start writing a moment you want to remember.'}
              </p>
              {!isTrash && (
                <button
                  type="button"
                  onClick={beginNew}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  <Plus size={16} /> Write an entry
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
