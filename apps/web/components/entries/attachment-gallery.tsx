/* eslint-disable @next/next/no-img-element -- Load private URLs directly without Next image caching. */
'use client';

import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AttachmentItem } from './use-attachment-editor';

type GalleryActions = {
  remove: (id: string) => void;
  insert: (item: AttachmentItem) => void;
  move: (id: string, index: number) => void;
  retry: (item: AttachmentItem) => void;
};

function name(item: AttachmentItem) {
  return item.fileName || 'Photo';
}

export function AttachmentGallery({
  items,
  actions,
}: {
  items: AttachmentItem[];
  actions?: GalleryActions;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const dragging = useRef<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = items.filter((item) => item.status === 'ready' && item.url);
  const activeIndex = photos.findIndex((item) => item.id === preview);
  const active = photos[activeIndex];
  const previewOpen = Boolean(active);

  useEffect(() => {
    const element = dialog.current;
    if (element && previewOpen && !element.open) element.showModal();
    if (element?.open && !previewOpen) element.close();
  }, [previewOpen]);

  function navigate(offset: number) {
    if (photos.length)
      setPreview(photos[(activeIndex + offset + photos.length) % photos.length].id);
  }

  if (!items.length) return null;
  return (
    <section aria-label="Photos" className="mb-6">
      <h2 className="mb-3 text-xs font-semibold text-text-secondary">Photos</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable={Boolean(actions && item.status === 'ready')}
            onDragStart={(event) => {
              if (!actions) return;
              dragging.current = item.id;
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('application/x-journalpilot-photo', item.id);
            }}
            onDragEnd={() => {
              dragging.current = null;
            }}
            onDragOver={(event) => {
              if (dragging.current) event.preventDefault();
            }}
            onDrop={(event) => {
              if (actions && dragging.current) {
                event.preventDefault();
                actions.move(dragging.current, index);
                dragging.current = null;
              }
            }}
            className="min-w-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary"
          >
            {item.url ? (
              <button
                type="button"
                onClick={() => setPreview(item.id)}
                aria-label={`Preview ${name(item)}`}
                className="block aspect-square w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-brand-400"
              >
                <img
                  src={item.url}
                  alt={name(item)}
                  referrerPolicy="no-referrer"
                  className="size-full object-cover transition-transform hover:scale-105 motion-reduce:transition-none"
                  draggable={false}
                />
              </button>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-2 px-2 text-center text-xs text-text-tertiary">
                <ImageIcon size={20} aria-hidden="true" />
                {item.status === 'uploading' && (
                  <progress
                    aria-label={`Uploading ${name(item)}`}
                    value={item.percent}
                    max={100}
                    className="h-1.5 w-3/4 accent-indigo-500"
                  />
                )}
                <span aria-live="polite">
                  {item.status === 'queued' && 'Waiting'}
                  {item.status === 'uploading' && `Uploading ${item.percent ?? 0}%`}
                  {item.status === 'verifying' && 'Verifying'}
                  {item.status === 'error' && <span className="text-error-500">{item.error}</span>}
                  {item.status === 'ready' && 'Photo unavailable'}
                </span>
              </div>
            )}
            {actions && (
              <div className="flex min-h-10 items-center px-1 py-1">
                {item.status === 'ready' && (
                  <>
                    <button
                      type="button"
                      onClick={() => actions.insert(item)}
                      aria-label={`Insert ${name(item)} into entry`}
                      title="Insert into entry"
                      className="inline-flex h-8 min-w-0 items-center gap-1 rounded-md px-1 text-xs text-brand-300 hover:bg-bg-base"
                    >
                      <span className="truncate">Insert</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.move(item.id, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move ${name(item)} earlier`}
                      className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-bg-base disabled:opacity-30"
                    >
                      <ArrowLeft size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.move(item.id, index + 1)}
                      disabled={index === items.length - 1}
                      aria-label={`Move ${name(item)} later`}
                      className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-bg-base disabled:opacity-30"
                    >
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </>
                )}
                {item.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => actions.retry(item)}
                    className="inline-flex h-8 min-w-0 items-center gap-1 rounded-md px-1 text-xs text-brand-300 hover:bg-bg-base"
                  >
                    <RotateCcw size={14} aria-hidden="true" /> Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => actions.remove(item.id)}
                  aria-label={`Remove ${name(item)}`}
                  className="ml-auto grid size-7 shrink-0 place-items-center rounded-md text-text-tertiary hover:bg-error-500/10 hover:text-error-500"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        aria-label="Photo preview"
        onClose={() => setPreview(null)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') navigate(-1);
          if (event.key === 'ArrowRight') navigate(1);
        }}
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-bg-base p-0 text-text-primary backdrop:bg-black/80"
      >
        {active && (
          <div className="flex h-full flex-col">
            <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-6">
              <p className="truncate text-sm text-text-secondary">{name(active)}</p>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Close photo preview"
                className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-bg-secondary"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center px-4">
              <img
                src={active.url ?? undefined}
                alt={name(active)}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex min-h-16 items-center justify-center gap-5 pb-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Previous photo"
                  className="grid size-10 place-items-center rounded-lg hover:bg-bg-secondary"
                >
                  <ArrowLeft size={20} />
                </button>
                <span className="text-xs text-text-tertiary">
                  {activeIndex + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  aria-label="Next photo"
                  className="grid size-10 place-items-center rounded-lg hover:bg-bg-secondary"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
