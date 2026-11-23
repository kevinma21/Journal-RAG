import { useEffect, useRef, useState } from 'react';
import { imageMimeTypes, maxEntryAttachments, maxImageBytes } from '@journalpilot/validation';
import {
  cancelUpload,
  finalizeUpload,
  loadEntryMedia,
  mediaAttachmentsEnabled,
  uploadImage,
  type AttachmentDraft,
  type EntryAttachment,
} from '@/lib/entries/media';

export type AttachmentItem = EntryAttachment & {
  status: 'queued' | 'uploading' | 'verifying' | 'ready' | 'error';
  percent?: number;
  error?: string;
  staged?: boolean;
  file?: File;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Image could not be loaded';
}

export function useAttachmentEditor({
  journalId,
  entryId,
  draftId,
  initial,
  onDraftChange,
}: {
  journalId: string;
  entryId?: string;
  draftId: string;
  initial?: AttachmentDraft;
  onDraftChange: (draft: AttachmentDraft | undefined) => void;
}) {
  const [items, setItems] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(mediaAttachmentsEnabled && Boolean(entryId || initial));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef<AttachmentItem[]>([]);
  const callback = useRef(onDraftChange);
  const restored = useRef(initial);
  const queue = useRef(Promise.resolve());
  const operations = useRef(new Map<string, AbortController>());
  const [reload, setReload] = useState(0);

  useEffect(() => {
    callback.current = onDraftChange;
  }, [onDraftChange]);

  useEffect(() => {
    if (!mediaAttachmentsEnabled) return;
    const controller = new AbortController();
    const activeOperations = operations.current;
    const draft = restored.current;

    async function load() {
      try {
        const committed = entryId ? await loadEntryMedia(entryId, controller.signal) : [];
        const loaded = new Map<string, AttachmentItem>(
          committed.map((item) => [item.id, { ...item, status: 'ready' }]),
        );
        for (const id of draft?.stagedIds ?? []) {
          if (loaded.has(id)) continue;
          try {
            const item = await finalizeUpload(id, controller.signal);
            loaded.set(id, { ...item, staged: true, status: 'ready' });
          } catch (error) {
            loaded.set(id, {
              id,
              staged: true,
              status: 'error',
              fileName: 'Draft photo',
              fileSize: null,
              mimeType: '',
              url: null,
              error: errorMessage(error),
            });
          }
        }
        if (controller.signal.aborted) return;
        const ordered = draft
          ? draft.ids.flatMap((id) => loaded.get(id) ?? [])
          : [...loaded.values()];
        itemsRef.current = ordered;
        setItems(ordered);
        setLoadError(null);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(errorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (entryId || draft) void load();
    return () => {
      controller.abort();
      for (const operation of activeOperations.values()) operation.abort();
      activeOperations.clear();
    };
  }, [entryId, reload]);

  useEffect(() => {
    if (!mediaAttachmentsEnabled) return;
    const controller = new AbortController();
    const timer = window.setInterval(async () => {
      const ready = itemsRef.current.filter((item) => item.status === 'ready');
      if (!ready.length) return;
      const staged = ready.filter((item) => item.staged);
      const [committed, ...drafts] = await Promise.all([
        entryId ? loadEntryMedia(entryId, controller.signal).catch(() => []) : [],
        ...staged.map((item) => finalizeUpload(item.id, controller.signal).catch(() => null)),
      ]);
      if (controller.signal.aborted) return;
      const urls = new Map(committed.map((item) => [item.id, item.url]));
      for (const draft of drafts) {
        if (draft) urls.set(draft.id, draft.url);
      }
      if (!urls.size) return;
      const refreshed = itemsRef.current.map((item) =>
        item.status === 'ready' && urls.has(item.id)
          ? { ...item, url: urls.get(item.id) ?? null }
          : item,
      );
      itemsRef.current = refreshed;
      setItems(refreshed);
    }, 4 * 60_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [entryId]);

  function persist(next: AttachmentItem[]) {
    const recoverable = next.filter(
      (item) => item.status === 'ready' || (item.staged && !item.file),
    );
    const draft = {
      ids: recoverable.map(({ id }) => id),
      stagedIds: recoverable.filter(({ staged }) => staged).map(({ id }) => id),
    };
    restored.current = draft;
    callback.current(draft);
  }

  function change(next: AttachmentItem[], saveDraft = false) {
    itemsRef.current = next;
    setItems(next);
    if (saveDraft) persist(next);
  }

  function update(id: string, patch: Partial<AttachmentItem>, saveDraft = false) {
    change(
      itemsRef.current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      saveDraft,
    );
  }

  function enqueue(item: AttachmentItem, retry: boolean) {
    const controller = new AbortController();
    operations.current.set(item.id, controller);
    queue.current = queue.current.then(async () => {
      if (controller.signal.aborted) return;
      try {
        let verified: EntryAttachment | undefined;
        if (retry) {
          update(item.id, { status: 'verifying', error: undefined });
          try {
            verified = await finalizeUpload(item.id, controller.signal);
          } catch (error) {
            if (!item.file || controller.signal.aborted) throw error;
          }
        }
        if (!verified && item.file) {
          update(item.id, { status: 'uploading', percent: 0, error: undefined });
          await uploadImage(
            journalId,
            entryId ?? draftId,
            entryId ? 'entry' : 'draft',
            item.id,
            item.file,
            controller.signal,
            (percent) => update(item.id, { percent }),
          );
          update(item.id, { status: 'verifying' });
          verified = await finalizeUpload(item.id, controller.signal);
        }
        if (!controller.signal.aborted && verified) {
          update(item.id, { ...verified, status: 'ready', file: undefined }, true);
        }
      } catch (error) {
        if (!controller.signal.aborted)
          update(item.id, { status: 'error', error: errorMessage(error) });
      } finally {
        if (operations.current.get(item.id) === controller) operations.current.delete(item.id);
      }
    });
  }

  function add(files: File[]) {
    const pending: AttachmentItem[] = [];
    const errors = new Set<string>();
    for (const file of files) {
      if (
        !imageMimeTypes.some((mime) => mime === file.type) ||
        file.size === 0 ||
        file.size > maxImageBytes
      ) {
        errors.add('Choose JPEG, PNG, or WebP photos up to 6 MiB.');
      } else if (itemsRef.current.length + pending.length >= maxEntryAttachments) {
        errors.add(`An entry can have up to ${maxEntryAttachments} photos.`);
      } else {
        pending.push({
          id: crypto.randomUUID(),
          staged: true,
          status: 'queued',
          file,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          url: null,
        });
      }
    }
    setNotice([...errors].join(' ') || null);
    change([...itemsRef.current, ...pending]);
    for (const item of pending) enqueue(item, false);
  }

  function remove(id: string) {
    const item = itemsRef.current.find((attachment) => attachment.id === id);
    operations.current.get(id)?.abort();
    if (item?.staged) void cancelUpload(id).catch(() => undefined);
    change(
      itemsRef.current.filter((attachment) => attachment.id !== id),
      true,
    );
  }

  function move(id: string, to: number) {
    const next = [...itemsRef.current];
    const from = next.findIndex((item) => item.id === id);
    if (from < 0 || to < 0 || to >= next.length) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    change(next, true);
  }

  function discard() {
    for (const item of itemsRef.current) {
      operations.current.get(item.id)?.abort();
      if (item.staged) void cancelUpload(item.id).catch(() => undefined);
    }
  }

  function reset() {
    discard();
    restored.current = undefined;
    change([]);
    callback.current(undefined);
    if (entryId) {
      setLoading(true);
      setReload((revision) => revision + 1);
    }
  }

  return {
    items,
    loading,
    loadError,
    notice,
    add,
    remove,
    move,
    discard,
    reset,
    retry: (item: AttachmentItem) => enqueue(item, true),
    reload: () => {
      setLoading(true);
      setReload((revision) => revision + 1);
    },
  };
}
