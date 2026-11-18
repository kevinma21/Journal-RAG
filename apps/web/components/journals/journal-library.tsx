'use client';

import { BookOpen, Plus, Search } from 'lucide-react';

import type { Journal } from '@/lib/journals/types';
import { JournalCard } from './journal-card';

type JournalLibraryProps = {
  journals: Journal[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (journal: Journal) => void;
  onDelete: (journal: Journal) => void;
};

export function JournalLibrary({
  journals,
  query,
  onQueryChange,
  onCreate,
  onEdit,
  onDelete,
}: JournalLibraryProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleJournals = normalizedQuery
    ? journals.filter((journal) =>
        `${journal.name} ${journal.description ?? ''}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : journals;

  if (journals.length === 0) {
    return (
      <section className="rounded-2xl border border-border-subtle bg-bg-primary px-6 py-14 text-center sm:py-20">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-bg-secondary text-brand-300">
          <BookOpen size={25} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-text-primary">A place for what matters</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
          Create your first journal. You can keep different parts of life in separate spaces.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
        >
          <Plus size={17} aria-hidden="true" /> Create a journal
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Your journals">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {journals.length} {journals.length === 1 ? 'journal' : 'journals'}
        </p>
        <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-border-subtle bg-bg-primary px-3 text-text-tertiary focus-within:border-border-focus sm:w-72">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search journals</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search journals"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </label>
      </div>

      {visibleJournals.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleJournals.map((journal) => (
            <li key={journal.id}>
              <JournalCard
                journal={journal}
                onEdit={() => onEdit(journal)}
                onDelete={() => onDelete(journal)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border-subtle px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">No journals match “{query}”.</p>
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="mt-3 text-sm font-medium text-brand-300 hover:text-text-primary"
          >
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
