import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateJournalInput,
  UpdateJournalInput,
} from '@journalpilot/validation';

import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.journal.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  create(userId: string, input: CreateJournalInput) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.user.upsert({
        where: { id: userId },
        create: { id: userId },
        update: {},
      });

      return transaction.journal.create({
        data: {
          userId,
          name: input.name,
          description: input.description || null,
          icon: input.icon,
          color: input.color,
        },
      });
    });
  }

  async update(userId: string, id: string, input: UpdateJournalInput) {
    const result = await this.prisma.journal.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description || null }
          : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Journal not found');
    }

    return this.prisma.journal.findFirstOrThrow({
      where: { id, userId, deletedAt: null },
    });
  }

  async remove(userId: string, id: string) {
    const result = await this.prisma.journal.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundException('Journal not found');
    }
  }
}
