'use client';

import { ChevronLeft, ChevronRight, FileText, Plus, Trash2 } from 'lucide-react';

import type { EntryPagination, JournalEntry } from '@/lib/entries/types';

type EntryTimelineProps = {
  entries: JournalEntry[];
  selectedId: string | null;
  pagination: EntryPagination;
  isTrash: boolean;
  onSelect: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onPageChange: (page: number) => void;
};

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(value) === dayKey(today.toISOString())) return 'Today';
  if (dayKey(value) === dayKey(yesterday.toISOString())) return 'Yesterday';

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

function preview(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, 'Code block')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function EntryTimeline({
  entries,
  selectedId,
  pagination,
  isTrash,
  onSelect,
  onNewEntry,
  onPageChange,
}: EntryTimelineProps) {
  const groups = entries.reduce<Array<{ label: string; entries: JournalEntry[] }>>(
    (result, entry) => {
      const label = formatDay(entry.occurredAt);
      const current = result.at(-1);
      if (current && dayKey(current.entries[0].occurredAt) === dayKey(entry.occurredAt)) {
        current.entries.push(entry);
      } else {
        result.push({ label, entries: [entry] });
      }
      return result;
    },
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {entries.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-bg-secondary text-text-tertiary">
              {isTrash ? (
                <Trash2 size={19} aria-hidden="true" />
              ) : (
                <FileText size={19} aria-hidden="true" />
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-text-primary">
              {isTrash ? 'Trash is empty' : 'No entries yet'}
            </p>
            <p className="mt-1 max-w-52 text-xs leading-5 text-text-tertiary">
              {isTrash
                ? 'Deleted entries will stay here until you restore or permanently delete them.'
                : 'Write down a moment to start this journal.'}
            </p>
            {!isTrash && (
              <button
                type="button"
                onClick={onNewEntry}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
              >
                <Plus size={15} aria-hidden="true" /> Write an entry
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <h3 className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.entries.map((entry) => {
                    const isSelected = entry.id === selectedId;
                    const title = entry.title?.trim() || 'Untitled entry';
                    const snippet = preview(entry.content);

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        aria-current={isSelected ? 'true' : undefined}
                        onClick={() => onSelect(entry)}
                        className={`w-full rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-300 ${isSelected ? 'bg-brand-500/15' : 'hover:bg-bg-secondary'}`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-text-primary">
                            {title}
                          </span>
                          <span className="shrink-0 text-[11px] text-text-tertiary">
                            {new Intl.DateTimeFormat(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            }).format(new Date(entry.occurredAt))}
                          </span>
                        </span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-text-secondary">
                          {snippet || 'No preview available'}
                        </span>
                        {isTrash && entry.deletedAt && (
                          <span className="mt-2 block text-[11px] text-text-tertiary">
                            Deleted{' '}
                            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                              new Date(entry.deletedAt),
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <nav
          aria-label="Entry pages"
          className="flex shrink-0 items-center justify-between border-t border-border-muted px-4 py-3"
        >
          <span className="text-xs text-text-tertiary">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-bg-secondary disabled:opacity-40"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-bg-secondary disabled:opacity-40"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
