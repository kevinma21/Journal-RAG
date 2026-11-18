'use client';

import { LoaderCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { apiFetch } from '@/lib/api/client';
import { getApiError, getNetworkError } from '@/lib/journals/http-error';
import { useActiveJournal } from '@/lib/journals/use-active-journal';
import type { Journal, JournalFormValues } from '@/lib/journals/types';
import { DeleteJournalDialog } from './delete-journal-dialog';
import { JournalFormDialog } from './journal-form-dialog';
import { JournalLibrary } from './journal-library';

type JournalDialogState = { type: 'create' } | { type: 'edit'; journal: Journal } | null;

type JournalManagementProps = {
  initialJournals: Journal[];
  initialError: string | null;
};

export function JournalManagement({ initialJournals, initialError }: JournalManagementProps) {
  const [journals, setJournals] = useState(initialJournals);
  const { activeId, selectActiveJournal } = useActiveJournal(journals);
  const [query, setQuery] = useState('');
  const [pageError, setPageError] = useState(initialError);
  const [dialog, setDialog] = useState<JournalDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function refreshJournals() {
    setIsLoading(true);
    setPageError(null);

    try {
      const response = await apiFetch('/v1/journals', { cache: 'no-store' });
      if (!response.ok) throw new Error(await getApiError(response));

      const nextJournals = (await response.json()) as Journal[];
      setJournals(nextJournals);
      if (!nextJournals.some((journal) => journal.id === activeId)) {
        selectActiveJournal(nextJournals[0]?.id ?? null);
      }
    } catch (error) {
      setPageError(getNetworkError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function saveJournal(values: JournalFormValues) {
    if (!dialog) return;
    setIsSaving(true);

    try {
      const isEditing = dialog.type === 'edit';
      const response = await apiFetch(
        isEditing ? `/v1/journals/${dialog.journal.id}` : '/v1/journals',
        {
          method: isEditing ? 'PATCH' : 'POST',
          body: JSON.stringify(values),
        },
      );
      if (!response.ok) throw new Error(await getApiError(response));

      const savedJournal = (await response.json()) as Journal;
      if (isEditing) {
        setJournals((current) =>
          current.map((journal) => (journal.id === savedJournal.id ? savedJournal : journal)),
        );
      } else {
        setJournals((current) => [savedJournal, ...current]);
        selectActiveJournal(savedJournal.id);
      }
      setPageError(null);
      setDialog(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteJournal() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const response = await apiFetch(`/v1/journals/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(await getApiError(response));

      setJournals((current) => current.filter((journal) => journal.id !== deleteTarget.id));
      if (activeId === deleteTarget.id) {
        selectActiveJournal(journals.find((journal) => journal.id !== deleteTarget.id)?.id ?? null);
      }
      setPageError(null);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function openCreateDialog() {
    setPageError(null);
    setDialog({ type: 'create' });
  }

  function openEditDialog(journal: Journal) {
    setPageError(null);
    setDialog({ type: 'edit', journal });
  }

  function openDeleteDialog(journal: Journal) {
    setPageError(null);
    setDeleteTarget(journal);
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
            YOUR SPACE
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Journals
          </h1>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            A quiet place for the moments you want to keep.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
        >
          <Plus size={17} aria-hidden="true" /> New journal
        </button>
      </header>

      {pageError && journals.length > 0 && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error-500/40 bg-error-500/10 px-4 py-3 text-sm text-text-primary"
        >
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => void refreshJournals()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 font-medium text-brand-300 hover:text-text-primary disabled:opacity-50"
          >
            {isLoading ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw size={15} aria-hidden="true" />
            )}
            Retry
          </button>
        </div>
      )}

      {pageError && journals.length === 0 ? (
        <section className="rounded-2xl border border-border-subtle bg-bg-primary px-6 py-14 text-center sm:py-20">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-error-500/10 text-error-500">
            <RefreshCw size={23} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-text-primary">
            Your journals couldn’t load
          </h2>
          <p role="alert" className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
            {pageError}
          </p>
          <button
            type="button"
            onClick={() => void refreshJournals()}
            disabled={isLoading}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-border-subtle px-4 text-sm font-medium text-text-primary hover:bg-bg-secondary disabled:opacity-50"
          >
            {isLoading ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw size={15} aria-hidden="true" />
            )}
            Try again
          </button>
        </section>
      ) : (
        <JournalLibrary
          journals={journals}
          activeId={activeId}
          query={query}
          onQueryChange={setQuery}
          onSelect={selectActiveJournal}
          onCreate={openCreateDialog}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      )}

      {dialog && (
        <JournalFormDialog
          key={dialog.type === 'edit' ? dialog.journal.id : 'new-journal'}
          journal={dialog.type === 'edit' ? dialog.journal : undefined}
          isSaving={isSaving}
          onClose={() => setDialog(null)}
          onSubmit={saveJournal}
        />
      )}

      {deleteTarget && (
        <DeleteJournalDialog
          journal={deleteTarget}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteJournal}
        />
      )}
    </section>
  );
}
