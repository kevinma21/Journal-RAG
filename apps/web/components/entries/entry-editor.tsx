'use client';

import { ArrowLeft, Eye, FileEdit, LoaderCircle, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import type { EntryFormValues, JournalEntry } from '@/lib/entries/types';
import { MarkdownContent } from './markdown-content';

type EntryEditorProps = {
  entry: JournalEntry | null;
  values: EntryFormValues;
  hasLocalDraft: boolean;
  localDraftAvailable: boolean;
  isSaving: boolean;
  error: string | null;
  onValuesChange: (values: EntryFormValues) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onBackToList: () => void;
};

export function EntryEditor({
  entry,
  values,
  hasLocalDraft,
  localDraftAvailable,
  isSaving,
  error,
  onValuesChange,
  onSave,
  onCancel,
  onBackToList,
}: EntryEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSave();
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-muted px-5 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            aria-label="Back to entries"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-secondary lg:hidden"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-tertiary">
              {entry ? 'Editing entry' : 'New entry'}
            </p>
            <p className="truncate text-sm font-medium text-text-secondary">
              {hasLocalDraft ? 'Draft saved on this device' : 'Your writing stays yours'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="hidden h-9 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary sm:inline-flex sm:items-center disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !values.content.trim()}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={15} aria-hidden="true" />
            )}
            {isSaving ? 'Saving' : 'Save'}
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-9">
        <div className="mx-auto w-full max-w-3xl">
          {localDraftAvailable && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-warning-500/30 bg-warning-500/10 px-3.5 py-2.5 text-xs text-text-secondary">
              <span>A saved local draft is available for this entry.</span>
              <button
                type="button"
                onClick={() =>
                  onValuesChange({ title: '', content: '', occurredAt: values.occurredAt })
                }
                className="shrink-0 font-medium text-warning-500 hover:text-text-primary"
              >
                Start fresh
              </button>
            </div>
          )}

          <input
            value={values.title}
            maxLength={500}
            onChange={(event) => onValuesChange({ ...values, title: event.target.value })}
            placeholder="Title"
            aria-label="Entry title"
            className="mb-3 w-full bg-transparent text-3xl font-semibold tracking-tight text-text-primary outline-none placeholder:text-text-tertiary/70 sm:text-4xl"
          />

          <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-tertiary">
            <label className="inline-flex items-center gap-2">
              <span>Moment date</span>
              <input
                type="datetime-local"
                required
                value={values.occurredAt}
                onChange={(event) => onValuesChange({ ...values, occurredAt: event.target.value })}
                className="rounded-md border border-border-subtle bg-bg-base px-2 py-1.5 text-xs text-text-secondary outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            {entry && (
              <span>
                Last edited{' '}
                {new Intl.DateTimeFormat(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                }).format(new Date(entry.updatedAt))}
              </span>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between border-b border-border-muted">
            <div className="flex gap-1" role="tablist" aria-label="Entry content mode">
              <button
                type="button"
                role="tab"
                aria-selected={!previewMode}
                onClick={() => setPreviewMode(false)}
                className={`inline-flex h-9 items-center gap-2 border-b-2 px-3 text-sm font-medium ${previewMode ? 'border-transparent text-text-tertiary hover:text-text-secondary' : 'border-brand-400 text-text-primary'}`}
              >
                <FileEdit size={15} aria-hidden="true" /> Write
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewMode}
                onClick={() => setPreviewMode(true)}
                className={`inline-flex h-9 items-center gap-2 border-b-2 px-3 text-sm font-medium ${previewMode ? 'border-brand-400 text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
              >
                <Eye size={15} aria-hidden="true" /> Preview
              </button>
            </div>
            <span className="hidden text-xs text-text-tertiary sm:inline">Markdown supported</span>
          </div>

          {previewMode ? (
            <div role="tabpanel" className="min-h-[50vh] rounded-lg px-1 py-3 sm:min-h-[56vh]">
              {values.content.trim() ? (
                <MarkdownContent content={values.content} />
              ) : (
                <p className="text-sm text-text-tertiary">Nothing to preview yet.</p>
              )}
            </div>
          ) : (
            <textarea
              value={values.content}
              onChange={(event) => onValuesChange({ ...values, content: event.target.value })}
              maxLength={100_000}
              required
              aria-label="Entry content in Markdown"
              placeholder="Write about what happened…"
              className="min-h-[50vh] w-full resize-y bg-transparent text-base leading-7 text-text-primary outline-none placeholder:text-text-tertiary/70 sm:min-h-[56vh]"
            />
          )}

          <div className="mt-4 flex min-h-6 items-center justify-between gap-3 text-xs">
            {error ? (
              <p role="alert" className="text-error-500">
                {error}
              </p>
            ) : (
              <p aria-live="polite" className="text-text-tertiary">
                {hasLocalDraft
                  ? 'Local draft saved'
                  : 'Drafts are saved on this device while you write'}
              </p>
            )}
            <span className="shrink-0 text-text-tertiary">
              {values.content.length.toLocaleString()} / 100,000
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
