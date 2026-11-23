import { apiFetch } from '@/lib/api/client';
import { getApiError } from '@/lib/journals/http-error';

export const mediaAttachmentsEnabled = process.env.NEXT_PUBLIC_MEDIA_ATTACHMENTS === 'true';

export type EntryAttachment = {
  id: string;
  fileName: string | null;
  mimeType: string;
  fileSize: number | null;
  url: string | null;
};

export type AttachmentDraft = {
  ids: string[];
  stagedIds: string[];
};

async function request<T>(path: string, init?: RequestInit) {
  const response = await apiFetch(path, { ...init, cache: 'no-store' });
  if (!response.ok) throw new Error(await getApiError(response));
  return ((await response.json()) as { data: T }).data;
}

export function loadEntryMedia(entryId: string, signal?: AbortSignal) {
  return request<EntryAttachment[]>(`/v1/entries/${entryId}/media`, { signal });
}

export function finalizeUpload(id: string, signal?: AbortSignal) {
  return request<EntryAttachment>(`/v1/media-uploads/${id}/finalize`, { method: 'POST', signal });
}

export async function cancelUpload(id: string) {
  await apiFetch(`/v1/media-uploads/${id}`, { method: 'DELETE' });
}

export async function uploadImage(
  journalId: string,
  targetEntryId: string,
  target: 'draft' | 'entry',
  id: string,
  file: File,
  signal: AbortSignal,
  progress: (percent: number) => void,
) {
  const ticket = await request<{ uploadUrl: string }>(`/v1/journals/${journalId}/media-uploads`, {
    method: 'POST',
    signal,
    body: JSON.stringify({
      uploadId: id,
      targetEntryId,
      target,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
  });

  await new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    signal.addEventListener('abort', abort, { once: true });
    xhr.open('PUT', ticket.uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.timeout = 90_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) progress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onloadend = () => {
      signal.removeEventListener('abort', abort);
      if (signal.aborted) reject(signal.reason);
      else if (xhr.status >= 200 && xhr.status < 300) resolve();
      else
        reject(new Error('Upload interrupted. Retry to check whether the image reached Storage.'));
    };
    xhr.send(file);
  });
}
