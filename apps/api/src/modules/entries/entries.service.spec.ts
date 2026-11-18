import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../database/prisma.service.js';
import { EntriesService } from './entries.service.js';

const ownerId = 'f0cc6ec4-11d2-4be8-8d6c-2dbe8187d4c8';
const journalId = '8c949e64-6478-48c1-85ad-bc0ac3786ce2';
const entryId = '07dcb810-42ac-4cb2-a68b-bab68a7a4f3c';

describe('EntriesService ownership and CRUD', () => {
  const transaction = {
    journal: { findFirst: vi.fn() },
    journalEntry: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      findFirstOrThrow: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  const prisma = { withUserContext: vi.fn() };
  let service: EntriesService;

  beforeEach(() => {
    vi.resetAllMocks();
    prisma.withUserContext.mockImplementation(
      async (_userId: string, operation: (tx: typeof transaction) => unknown) =>
        operation(transaction),
    );
    service = new EntriesService(prisma as unknown as PrismaService);
  });

  it('lists only active entries in a journal owned by the authenticated user', async () => {
    transaction.journal.findFirst.mockResolvedValue({ id: journalId });
    transaction.journalEntry.findMany.mockResolvedValue([]);
    transaction.journalEntry.count.mockResolvedValue(0);

    await service.list(ownerId, {
      journalId,
      q: 'trip',
      from: '2026-11-01',
      to: '2026-11-18',
      page: 1,
      limit: 25,
    });

    expect(transaction.journal.findFirst).toHaveBeenCalledWith({
      where: { id: journalId, userId: ownerId, deletedAt: null },
      select: { id: true },
    });
    expect(transaction.journalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          journalId,
          deletedAt: null,
        }),
        orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      }),
    );
    const where = transaction.journalEntry.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { title: { contains: 'trip', mode: 'insensitive' } },
      { content: { contains: 'trip', mode: 'insensitive' } },
    ]);
    expect(where.occurredAt.gte.toISOString()).toBe('2026-11-01T00:00:00.000Z');
    expect(where.occurredAt.lt.toISOString()).toBe('2026-11-19T00:00:00.000Z');
  });

  it('does not list entries when the requested journal belongs to another user', async () => {
    transaction.journal.findFirst.mockResolvedValue(null);

    await expect(
      service.list(ownerId, { journalId, page: 1, limit: 25 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.journalEntry.findMany).not.toHaveBeenCalled();
  });

  it('creates an entry only after confirming journal ownership', async () => {
    const entry = { id: entryId, journalId, content: 'A memory' };
    transaction.journal.findFirst.mockResolvedValue({ id: journalId });
    transaction.journalEntry.create.mockResolvedValue(entry);

    await expect(
      service.create(ownerId, { journalId, content: 'A memory' }),
    ).resolves.toEqual({ data: entry });
    expect(transaction.journal.findFirst).toHaveBeenCalledWith({
      where: { id: journalId, userId: ownerId, deletedAt: null },
      select: { id: true },
    });
    expect(transaction.journalEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ journalId, content: 'A memory' }),
    });
  });

  it('scopes detail, update, and soft deletion through journal ownership', async () => {
    transaction.journalEntry.findFirst.mockResolvedValue(null);
    await expect(service.get(ownerId, entryId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transaction.journalEntry.findFirst).toHaveBeenCalledWith({
      where: {
        id: entryId,
        deletedAt: null,
        journal: { is: { userId: ownerId, deletedAt: null } },
      },
    });

    transaction.journalEntry.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.update(ownerId, entryId, { content: 'Changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.journalEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: entryId,
          deletedAt: null,
          journal: { is: { userId: ownerId, deletedAt: null } },
        },
      }),
    );

    await expect(service.moveToTrash(ownerId, entryId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transaction.journalEntry.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {
          id: entryId,
          deletedAt: null,
          journal: { is: { userId: ownerId, deletedAt: null } },
        },
        data: { deletedAt: expect.any(Date) },
      }),
    );
  });

  it('scopes Trash, restore, and permanent deletion to the owning user', async () => {
    transaction.journalEntry.findMany.mockResolvedValue([]);
    transaction.journalEntry.count.mockResolvedValue(0);
    await service.listTrash(ownerId, { journalId, page: 1, limit: 25 });
    expect(transaction.journalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: { not: null },
          journal: { is: { userId: ownerId, id: journalId } },
        }),
      }),
    );

    transaction.journalEntry.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.restore(ownerId, entryId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transaction.journalEntry.updateMany).toHaveBeenLastCalledWith({
      where: {
        id: entryId,
        deletedAt: { not: null },
        journal: { is: { userId: ownerId, deletedAt: null } },
      },
      data: { deletedAt: null },
    });

    transaction.journalEntry.deleteMany.mockResolvedValue({ count: 0 });
    await expect(
      service.permanentlyDelete(ownerId, entryId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.journalEntry.deleteMany).toHaveBeenCalledWith({
      where: {
        id: entryId,
        deletedAt: { not: null },
        journal: { is: { userId: ownerId } },
      },
    });
  });
});
