import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  maxImageBytes,
  type ReserveMediaUploadInput,
} from '@journalpilot/validation';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { MediaStorage, readUrlSeconds } from './media-storage.js';

const uploadLifetime = 24 * 60 * 60 * 1000;
const tokenLifetimeWithGrace = (2 * 60 * 60 + 120) * 1000;
const maxPending = 48;

async function assertTarget(
  tx: Prisma.TransactionClient,
  userId: string,
  journalId: string,
  entryId: string,
  required: boolean,
) {
  const journal = await tx.journal.findFirst({
    where: { id: journalId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!journal) throw new NotFoundException('Journal not found');
  const entry = await tx.journalEntry.findUnique({
    where: { id: entryId },
    select: { journalId: true, deletedAt: true },
  });
  if (
    (required && !entry) ||
    (entry && (entry.journalId !== journalId || entry.deletedAt))
  ) {
    throw new NotFoundException('Entry not found');
  }
  return Boolean(entry);
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorage,
  ) {}

  async reserve(
    userId: string,
    journalId: string,
    input: ReserveMediaUploadInput,
  ) {
    const uploadId = input.uploadId.toLowerCase();
    const targetEntryId = input.targetEntryId.toLowerCase();
    const tokenUntil = new Date(Date.now() + tokenLifetimeWithGrace);

    const path = await this.prisma.withUserContext(userId, async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
      const exists = await assertTarget(
        tx,
        userId,
        journalId,
        targetEntryId,
        input.target === 'entry',
      );
      if (input.target === 'draft' && exists)
        throw new ConflictException('Entry is already saved');

      const row = await tx.mediaUpload.findUnique({ where: { id: uploadId } });
      if (row) {
        if (
          row.journalId !== journalId.toLowerCase() ||
          row.targetEntryId !== targetEntryId ||
          row.fileSize !== input.fileSize ||
          row.mimeType !== input.mimeType ||
          row.fileName !== input.fileName ||
          row.state !== 'PENDING' ||
          row.expiresAt <= tokenUntil
        ) {
          throw new ConflictException('Upload reservation cannot be renewed');
        }
        const updated = await tx.mediaUpload.updateMany({
          where: { id: uploadId, state: 'PENDING' },
          data: { uploadTokenValidUntil: tokenUntil },
        });
        if (!updated.count)
          throw new ConflictException('Upload reservation changed');
        return row.storagePath;
      }
      const count = await tx.mediaUpload.count({
        where: {
          userId,
          state: { in: ['PENDING', 'READY'] },
          expiresAt: { gt: new Date() },
        },
      });
      if (count >= maxPending)
        throw new ConflictException('Too many unfinished uploads');
      const storagePath = `${userId}/${journalId.toLowerCase()}/${randomUUID()}`;
      const inserted = await tx.mediaUpload.createMany({
        data: {
          id: uploadId,
          userId,
          journalId,
          targetEntryId,
          storagePath,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          expiresAt: new Date(Date.now() + uploadLifetime),
          uploadTokenValidUntil: tokenUntil,
        },
        skipDuplicates: true,
      });
      if (!inserted.count)
        throw new ConflictException('Upload ID is unavailable');
      return storagePath;
    });

    const { data, error } = await this.storage.bucket.createSignedUploadUrl(
      path,
      { upsert: false },
    );
    if (error || !data)
      throw new ServiceUnavailableException('Could not authorize upload');
    return { data: { id: uploadId, uploadUrl: data.signedUrl } };
  }

  async finalize(userId: string, uploadId: string) {
    const upload = await this.prisma.withUserContext(userId, async (tx) => {
      const row = await tx.mediaUpload.findUnique({ where: { id: uploadId } });
      if (
        !row ||
        !['PENDING', 'READY'].includes(row.state) ||
        row.expiresAt <= new Date()
      ) {
        throw new NotFoundException('Upload reservation not found');
      }
      await assertTarget(tx, userId, row.journalId, row.targetEntryId, false);
      return row;
    });

    if (upload.state === 'PENDING') {
      const { data: info, error: infoError } = await this.storage.bucket.info(
        upload.storagePath,
      );
      if (infoError || !info)
        throw new ConflictException('Uploaded image is not available yet');
      if (info.size !== upload.fileSize || info.size > maxImageBytes) {
        await this.cancel(userId, uploadId);
        throw new BadRequestException('Uploaded image size does not match');
      }
      const { data: file, error } = await this.storage.bucket.download(
        upload.storagePath,
      );
      if (error || !file)
        throw new ServiceUnavailableException('Could not verify image');

      try {
        if (file.size !== upload.fileSize || file.size > maxImageBytes)
          throw new Error('Invalid image size');
        const image = sharp(Buffer.from(await file.arrayBuffer()), {
          limitInputPixels: 24_000_000,
          failOn: 'warning',
        });
        const { format, pages } = await image.metadata();
        if (`image/${format}` !== upload.mimeType || (pages ?? 1) !== 1) {
          throw new Error('Invalid image format');
        }
        await image.stats();
      } catch {
        await this.cancel(userId, uploadId);
        throw new BadRequestException('Uploaded file is not a supported image');
      }

      await this.prisma.withUserContext(userId, async (tx) => {
        await assertTarget(
          tx,
          userId,
          upload.journalId,
          upload.targetEntryId,
          false,
        );
        const updated = await tx.mediaUpload.updateMany({
          where: {
            id: upload.id,
            state: 'PENDING',
            expiresAt: { gt: new Date() },
          },
          data: { state: 'READY' },
        });
        if (
          updated.count === 0 &&
          !(await tx.mediaUpload.findFirst({
            where: {
              id: upload.id,
              state: 'READY',
              expiresAt: { gt: new Date() },
            },
            select: { id: true },
          }))
        )
          throw new ConflictException('Upload reservation is no longer active');
      });
    }
    const { data, error } = await this.storage.bucket.createSignedUrl(
      upload.storagePath,
      readUrlSeconds,
    );
    if (error || !data)
      throw new ServiceUnavailableException('Could not open image preview');
    return { data: this.attachment(upload, data.signedUrl) };
  }

  async cancel(userId: string, uploadId: string) {
    await this.prisma.withUserContext(userId, async (tx) => {
      const upload = await tx.mediaUpload.findUnique({
        where: { id: uploadId },
      });
      if (!upload || upload.state === 'ATTACHED')
        throw new NotFoundException('Upload reservation not found');
      await tx.$executeRaw`
        UPDATE public.media_uploads SET state = 'CLEANUP_PENDING',
          "nextCleanupAt" = GREATEST(now(), "uploadTokenValidUntil")
        WHERE id = ${uploadId}::uuid AND state IN ('PENDING', 'READY')
      `;
    });
  }

  async list(userId: string, entryId: string) {
    const media = await this.prisma.withUserContext(userId, async (tx) => {
      const entry = await tx.journalEntry.findFirst({
        where: { id: entryId, journal: { is: { userId, deletedAt: null } } },
        select: {
          media: {
            where: { deletedAt: null },
            orderBy: [{ position: 'asc' }, { id: 'asc' }],
          },
        },
      });
      if (!entry) throw new NotFoundException('Entry not found');
      return entry.media;
    });
    if (!media.length) return { data: [] };
    const { data, error } = await this.storage.bucket.createSignedUrls(
      media.map((item) => item.storagePath),
      readUrlSeconds,
    );
    if (error || !data)
      throw new ServiceUnavailableException('Could not open attachments');
    const urls = new Map(
      data.map((item) => [item.path, item.error ? null : item.signedUrl]),
    );
    return {
      data: media.map((item) =>
        this.attachment(item, urls.get(item.storagePath) ?? null),
      ),
    };
  }

  private attachment(
    item: {
      id: string;
      fileName: string | null;
      mimeType: string;
      fileSize: number | null;
    },
    url: string | null,
  ) {
    return {
      id: item.id,
      fileName: item.fileName,
      mimeType: item.mimeType,
      fileSize: item.fileSize,
      url,
    };
  }
}
