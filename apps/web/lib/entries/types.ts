import type { Journal } from '@/lib/journals/types';
import type { AttachmentDraft } from './media';

export type JournalEntry = {
  id: string;
  journalId: string;
  title: string | null;
  content: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  revision: number;
};

export type EntryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EntryPage = {
  data: JournalEntry[];
  meta: { pagination: EntryPagination };
};

export type EntryDraft = {
  title: string;
  content: string;
  occurredAt: string;
  savedAt: string;
  draftId?: string;
  baseRevision?: number;
  attachments?: AttachmentDraft;
};

export type EntryFormValues = {
  title: string;
  content: string;
  occurredAt: string;
};

export type JournalWorkspaceResult = {
  journal: Journal | null;
  entries: JournalEntry[];
  pagination: EntryPagination;
  error: string | null;
};

export type EntryFilters = {
  q: string;
  from: string;
  to: string;
};
