import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateJournalEntryInput,
  JournalEntryListQuery,
  JournalEntryTrashQuery,
  UpdateJournalEntryInput,
} from '@journalpilot/validation';
import type { Prisma } from '../../generated/prisma/client.js';

import { PrismaService } from '../../database/prisma.service.js';

const DEFAULT_PAGE_SIZE = 25;

function pagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function dateRange(from?: string, to?: string) {
  const occurredAt: Prisma.DateTimeFilter = {};

  if (from) occurredAt.gte = new Date(`${from}T00:00:00.000Z`);
  if (to) {
    const endExclusive = new Date(`${to}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    occurredAt.lt = endExclusive;
  }

  return Object.keys(occurredAt).length > 0 ? occurredAt : undefined;
}

function searchFilter(query?: string): Prisma.JournalEntryWhereInput {
  const search = query?.trim();
  if (!search) return {};

  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ],
  };
}

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, filters: JournalEntryListQuery) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const journal = await transaction.journal.findFirst({
        where: { id: filters.journalId, userId, deletedAt: null },
        select: { id: true },
      });

      if (!journal) throw new NotFoundException('Journal not found');

      const range = dateRange(filters.from, filters.to);
      const where: Prisma.JournalEntryWhereInput = {
        journalId: journal.id,
        deletedAt: null,
        ...(range ? { occurredAt: range } : {}),
        ...searchFilter(filters.q),
      };
      const page = filters.page ?? 1;
      const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
      const skip = (page - 1) * limit;

      const [entries, total] = await Promise.all([
        transaction.journalEntry.findMany({
          where,
          orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: limit,
        }),
        transaction.journalEntry.count({ where }),
      ]);

      return {
        data: entries,
        meta: { pagination: pagination(page, limit, total) },
      };
    });
  }

  async listTrash(userId: string, filters: JournalEntryTrashQuery) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const where: Prisma.JournalEntryWhereInput = {
        deletedAt: { not: null },
        journal: {
          is: {
            userId,
            ...(filters.journalId ? { id: filters.journalId } : {}),
          },
        },
        ...searchFilter(filters.q),
      };
      const page = filters.page ?? 1;
      const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
      const skip = (page - 1) * limit;

      const [entries, total] = await Promise.all([
        transaction.journalEntry.findMany({
          where,
          orderBy: [{ deletedAt: 'desc' }, { occurredAt: 'desc' }],
          skip,
          take: limit,
        }),
        transaction.journalEntry.count({ where }),
      ]);

      return {
        data: entries,
        meta: { pagination: pagination(page, limit, total) },
      };
    });
  }

  async get(userId: string, id: string) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const entry = await transaction.journalEntry.findFirst({
        where: {
          id,
          deletedAt: null,
          journal: { is: { userId, deletedAt: null } },
        },
      });

      if (!entry) throw new NotFoundException('Entry not found');
      return { data: entry };
    });
  }

  async create(userId: string, input: CreateJournalEntryInput) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const journal = await transaction.journal.findFirst({
        where: { id: input.journalId, userId, deletedAt: null },
        select: { id: true },
      });

      if (!journal) throw new NotFoundException('Journal not found');

      const entry = await transaction.journalEntry.create({
        data: {
          journalId: journal.id,
          title: input.title?.trim() || null,
          content: input.content,
          occurredAt: input.occurredAt
            ? new Date(input.occurredAt)
            : new Date(),
        },
      });

      return { data: entry };
    });
  }

  async update(userId: string, id: string, input: UpdateJournalEntryInput) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const where: Prisma.JournalEntryWhereInput = {
        id,
        deletedAt: null,
        journal: { is: { userId, deletedAt: null } },
      };
      const result = await transaction.journalEntry.updateMany({
        where,
        data: {
          ...(input.title !== undefined
            ? { title: input.title?.trim() || null }
            : {}),
          ...(input.content !== undefined ? { content: input.content } : {}),
          ...(input.occurredAt !== undefined
            ? { occurredAt: new Date(input.occurredAt) }
            : {}),
        },
      });

      if (result.count === 0) throw new NotFoundException('Entry not found');

      const entry = await transaction.journalEntry.findFirstOrThrow({ where });
      return { data: entry };
    });
  }

  async moveToTrash(userId: string, id: string) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const result = await transaction.journalEntry.updateMany({
        where: {
          id,
          deletedAt: null,
          journal: { is: { userId, deletedAt: null } },
        },
        data: { deletedAt: new Date() },
      });

      if (result.count === 0) throw new NotFoundException('Entry not found');
    });
  }

  async restore(userId: string, id: string) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const where: Prisma.JournalEntryWhereInput = {
        id,
        deletedAt: { not: null },
        journal: { is: { userId, deletedAt: null } },
      };
      const result = await transaction.journalEntry.updateMany({
        where,
        data: { deletedAt: null },
      });

      if (result.count === 0)
        throw new NotFoundException('Entry not found in Trash');

      const entry = await transaction.journalEntry.findFirstOrThrow({
        where: { id, journal: { is: { userId, deletedAt: null } } },
      });
      return { data: entry };
    });
  }

  async permanentlyDelete(userId: string, id: string) {
    return this.prisma.withUserContext(userId, async (transaction) => {
      const result = await transaction.journalEntry.deleteMany({
        where: {
          id,
          deletedAt: { not: null },
          journal: { is: { userId } },
        },
      });

      if (result.count === 0)
        throw new NotFoundException('Entry not found in Trash');
    });
  }
}
