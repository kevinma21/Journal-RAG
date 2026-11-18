'use client';

import { ArrowLeft, FileEdit, RotateCcw, Trash2 } from 'lucide-react';

import type { JournalEntry } from '@/lib/entries/types';
import { MarkdownContent } from './markdown-content';

type EntryReaderProps = {
  entry: JournalEntry;
  isTrash: boolean;
  onEdit: () => void;
  onMoveToTrash: () => void;
  onRestore: () => void;
  onPermanentlyDelete: () => void;
  onBackToList: () => void;
};

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value));
}

export function EntryReader({
  entry,
  isTrash,
  onEdit,
  onMoveToTrash,
  onRestore,
  onPermanentlyDelete,
  onBackToList,
}: EntryReaderProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
              {isTrash ? 'Recently deleted' : 'Journal entry'}
            </p>
            <p className="truncate text-sm text-text-secondary">
              {formatDate(entry.occurredAt, { dateStyle: 'full' })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={onRestore}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-subtle px-3 text-sm font-medium text-text-primary hover:bg-bg-secondary"
              >
                <RotateCcw size={15} aria-hidden="true" /> Restore
              </button>
              <button
                type="button"
                onClick={onPermanentlyDelete}
                aria-label="Permanently delete entry"
                className="flex size-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-500/10 hover:text-error-500"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-subtle px-3 text-sm font-medium text-text-primary hover:bg-bg-secondary"
              >
                <FileEdit size={15} aria-hidden="true" /> Edit
              </button>
              <button
                type="button"
                onClick={onMoveToTrash}
                aria-label="Move entry to Trash"
                className="flex size-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-500/10 hover:text-error-500"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </header>

      <article className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {entry.title || formatDate(entry.occurredAt, { month: 'long', day: 'numeric' })}
          </h1>
          <div className="mb-9 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
            <span>{formatDate(entry.occurredAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <span aria-hidden="true">·</span>
            <span>
              {isTrash && entry.deletedAt
                ? `Deleted ${formatDate(entry.deletedAt, { dateStyle: 'medium' })}`
                : `Created ${formatDate(entry.createdAt, { dateStyle: 'medium' })}`}
            </span>
            {entry.updatedAt !== entry.createdAt && !isTrash && (
              <>
                <span aria-hidden="true">·</span>
                <span>Edited {formatDate(entry.updatedAt, { dateStyle: 'medium' })}</span>
              </>
            )}
          </div>
          <MarkdownContent content={entry.content} />
        </div>
      </article>
    </div>
  );
}
