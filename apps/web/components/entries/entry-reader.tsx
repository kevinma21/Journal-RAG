'use client';

import { ArrowLeft, FileEdit, RotateCcw, Trash2 } from 'lucide-react';

import { useEffect, useState } from 'react';
import { loadEntryMedia, mediaAttachmentsEnabled, type EntryAttachment } from '@/lib/entries/media';
import { AttachmentGallery } from './attachment-gallery';
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
  const [media, setMedia] = useState<EntryAttachment[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(mediaAttachmentsEnabled);
  const [photoError, setPhotoError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!mediaAttachmentsEnabled) return;
    const controller = new AbortController();
    async function load() {
      try {
        const gallery = await loadEntryMedia(entry.id, controller.signal);
        if (!controller.signal.aborted) {
          setMedia(gallery);
          setPhotoError(false);
        }
      } catch {
        if (!controller.signal.aborted) setPhotoError(true);
      } finally {
        if (!controller.signal.aborted) setLoadingPhotos(false);
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 4 * 60_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [entry.id, reload]);

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
          {loadingPhotos && (
            <p role="status" className="mb-4 text-xs text-text-tertiary">
              Loading photos…
            </p>
          )}
          {photoError && (
            <p role="alert" className="mb-4 text-xs text-error-500">
              Photos could not be loaded.
              <button
                type="button"
                onClick={() => setReload((count) => count + 1)}
                className="ml-2 text-brand-300"
              >
                Retry
              </button>
            </p>
          )}
          <AttachmentGallery items={media.map((item) => ({ ...item, status: 'ready' }))} />
          <MarkdownContent content={entry.content} attachments={media} />
        </div>
      </article>
    </div>
  );
}
