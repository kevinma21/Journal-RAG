import { BadRequestException, ConflictException } from '@nestjs/common';
import { mediaReferences } from '@journalpilot/validation';
import type { JournalEntry, Prisma } from '../../generated/prisma/client.js';

export async function saveEntryMedia(
  tx: Prisma.TransactionClient,
  userId: string,
  entry: JournalEntry,
  attachmentIds: string[] | undefined,
  validateContent: boolean,
) {
  const references =
    validateContent && entry.content.includes('journalpilot-media:')
      ? mediaReferences(entry.content)
      : [];
  if (attachmentIds === undefined && !references.length) return;

  const existing = await tx.media.findMany({
    where: { entryId: entry.id, deletedAt: null },
    select: { id: true, position: true },
  });
  const ids =
    attachmentIds?.map((id) => id.toLowerCase()) ??
    existing.map(({ id }) => id);
  const requested = new Set(ids);
  if (references.some(({ id }) => !requested.has(id))) {
    throw new BadRequestException(
      'An inline image is not attached to this entry',
    );
  }
  if (attachmentIds === undefined) return;

  const existingById = new Map(existing.map((item) => [item.id, item]));
  for (const [position, id] of ids.entries()) {
    const attached = existingById.get(id);
    if (attached) {
      if (attached.position !== position) {
        await tx.media.update({ where: { id }, data: { position } });
      }
      continue;
    }

    const claim = await tx.mediaUpload.updateMany({
      where: {
        id,
        userId,
        journalId: entry.journalId,
        targetEntryId: entry.id,
        state: 'READY',
        expiresAt: { gt: new Date() },
      },
      data: { state: 'ATTACHED' },
    });
    if (!claim.count)
      throw new ConflictException('An attachment is no longer available');

    const { storagePath, fileName, mimeType, fileSize } =
      await tx.mediaUpload.findUniqueOrThrow({ where: { id } });
    await tx.media.create({
      data: {
        id,
        entryId: entry.id,
        storagePath,
        fileName,
        mimeType,
        fileSize,
        position,
      },
    });
  }

  const removed = existing
    .filter(({ id }) => !requested.has(id))
    .map(({ id }) => id);
  if (removed.length) {
    await tx.media.deleteMany({
      where: { entryId: entry.id, id: { in: removed } },
    });
    await tx.$executeRaw`
      UPDATE public.media_uploads SET state = 'CLEANUP_PENDING',
        "nextCleanupAt" = GREATEST(now(), "uploadTokenValidUntil")
      WHERE "targetEntryId" = ${entry.id}::uuid AND id = ANY(${removed}::uuid[])
        AND state = 'ATTACHED'
    `;
  }
}

export async function scheduleDeletedEntryUploads(
  tx: Prisma.TransactionClient,
  entryId: string,
) {
  await tx.$executeRaw`
    UPDATE public.media_uploads SET state = 'CLEANUP_PENDING',
      "nextCleanupAt" = GREATEST(now(), "uploadTokenValidUntil")
    WHERE "targetEntryId" = ${entryId}::uuid AND state IN ('PENDING', 'READY', 'ATTACHED')
  `;
}
