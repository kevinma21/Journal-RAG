import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JournalWorkspace } from '@/components/entries/journal-workspace';
import { getInitialJournalWorkspace } from '@/lib/entries/server';

export default async function JournalEntriesPage({
  params,
}: {
  params: Promise<{ journalId: string }>;
}) {
  const { journalId } = await params;
  const initial = await getInitialJournalWorkspace(journalId);

  if (!initial.journal) {
    if (initial.error === 'This journal could not be found.') notFound();
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-border-subtle bg-bg-primary px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-text-primary">Couldn’t open this journal</h1>
        <p role="alert" className="mt-2 text-sm leading-6 text-text-secondary">
          {initial.error}
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-9 items-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          Back to journals
        </Link>
      </section>
    );
  }

  return (
    <JournalWorkspace
      journal={initial.journal}
      initialEntries={initial.entries}
      initialPagination={initial.pagination}
      initialError={initial.error}
    />
  );
}
