'use client';

import { CalendarDays, Check, Pencil, Trash2 } from 'lucide-react';

import { JOURNAL_COLORS, JOURNAL_ICONS } from './journal-appearance';
import type { Journal } from '@/lib/journals/types';

type JournalCardProps = {
  journal: Journal;
  selected: boolean;
  onSelect: () => void;
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

export function JournalCard({ journal, selected, onSelect, onEdit, onDelete }: JournalCardProps) {
  const Icon = JOURNAL_ICONS[journal.icon] ?? JOURNAL_ICONS.book;
  const color = JOURNAL_COLORS[journal.color] ?? JOURNAL_COLORS.indigo;

  return (
    <article
      className={`group flex min-h-56 flex-col rounded-xl border bg-bg-primary p-5 transition-colors ${
        selected
          ? 'border-brand-400/70 shadow-[0_0_0_1px_rgb(99_102_241/0.18)]'
          : 'border-border-subtle hover:border-text-tertiary/50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Select ${journal.name}${selected ? ', currently active' : ''}`}
          className={`flex size-12 items-center justify-center rounded-xl ${color.icon} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300`}
        >
          <Icon size={21} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-70 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
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

      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="mt-4 text-left focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand-300"
      >
        <span className="flex items-center gap-2">
          <span className="truncate text-lg font-semibold text-text-primary">{journal.name}</span>
          {selected && (
            <Check size={15} className="shrink-0 text-brand-300" aria-label="Active journal" />
          )}
        </span>
        <span className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">
          {journal.description || 'A personal space for your memories.'}
        </span>
      </button>

      <div className="mt-auto flex items-center gap-2 border-t border-border-muted pt-4 text-xs text-text-tertiary">
        <CalendarDays size={14} aria-hidden="true" />
        <span>Created {formatDate(journal.createdAt)}</span>
      </div>
    </article>
  );
}
