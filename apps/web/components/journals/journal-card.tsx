'use client';

import Link from 'next/link';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';

import { JOURNAL_COLORS, JOURNAL_ICONS } from './journal-appearance';
import type { Journal } from '@/lib/journals/types';

type JournalCardProps = {
  journal: Journal;
  onEdit: () => void;
  onDelete: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function JournalCard({ journal, onEdit, onDelete }: JournalCardProps) {
  const Icon = JOURNAL_ICONS[journal.icon] ?? JOURNAL_ICONS.book;
  const color = JOURNAL_COLORS[journal.color] ?? JOURNAL_COLORS.indigo;

  return (
    <article className="group relative flex min-h-56 flex-col rounded-xl border border-border-subtle bg-bg-primary p-5 transition-colors hover:border-text-tertiary/50">
      <Link
        href={`/journals/${journal.id}`}
        aria-label={`Open ${journal.name} journal entries`}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
      />
      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
        <span className={`flex size-12 items-center justify-center rounded-xl ${color.icon}`}>
          <Icon size={21} aria-hidden="true" />
        </span>
        <div className="pointer-events-auto flex items-center gap-1 opacity-100 transition-opacity sm:opacity-70 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${journal.name}`}
            className="flex size-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-bg-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand-300"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${journal.name}`}
            className="flex size-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-error-500/10 hover:text-error-500 focus-visible:outline-2 focus-visible:outline-error-500"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-4 text-left">
        <span className="flex items-center gap-2">
          <span className="truncate text-lg font-semibold text-text-primary">{journal.name}</span>
        </span>
        <span className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">
          {journal.description || 'A personal space for your memories.'}
        </span>
      </div>

      <div className="pointer-events-none relative z-10 mt-auto flex items-center gap-2 border-t border-border-muted pt-4 text-xs text-text-tertiary">
        <CalendarDays size={14} aria-hidden="true" />
        <span>Created {formatDate(journal.createdAt)}</span>
        <span className="ml-auto text-brand-300 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          Open journal →
        </span>
      </div>
    </article>
  );
}
