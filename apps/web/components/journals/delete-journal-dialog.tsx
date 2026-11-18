'use client';

import { LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { getNetworkError } from '@/lib/journals/http-error';
import type { Journal } from '@/lib/journals/types';

type DeleteJournalDialogProps = {
  journal: Journal;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteJournalDialog({
  journal,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteJournalDialogProps) {
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    try {
      await onConfirm();
    } catch (cause) {
      setError(getNetworkError(cause));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-journal-title"
        className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-2xl"
      >
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-error-500/10 text-error-500">
          <Trash2 size={18} aria-hidden="true" />
        </div>
        <h2 id="delete-journal-title" className="text-lg font-semibold text-text-primary">
          Delete “{journal.name}”?
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          This moves the journal out of your active list. Its entries remain stored and won’t appear
          in normal views.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-error-500">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-10 rounded-lg px-4 text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void handleConfirm()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-error-500 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isDeleting ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 size={15} aria-hidden="true" />
            )}
            Delete journal
          </button>
        </div>
      </section>
    </div>
  );
}
