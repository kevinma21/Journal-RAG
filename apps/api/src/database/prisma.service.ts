import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('Missing DATABASE_URL configuration');
    }

    const poolMax = process.env.DATABASE_POOL_MAX
      ? Number(process.env.DATABASE_POOL_MAX)
      : undefined;

    if (poolMax !== undefined && (!Number.isInteger(poolMax) || poolMax < 1)) {
      throw new Error('DATABASE_POOL_MAX must be a positive integer');
    }

    super({
      adapter: new PrismaPg({
        connectionString,
        ...(poolMax ? { max: poolMax } : {}),
      }),
    });
  }

  withUserContext<T>(
    userId: string,
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (transaction) => {
      // userId is taken from the Supabase identity verified by the auth guard.
      // The transaction-local setting is cleared automatically when the
      // interactive transaction completes, even when the connection is pooled.
      await transaction.$queryRaw`
        SELECT pg_catalog.set_config('journalpilot.user_id', ${userId}, true)
      `;

      return operation(transaction);
    });
  }

  async onModuleInit() {
    console.log('[startup] Connecting to PostgreSQL');
    await this.$connect();
    console.log('[startup] Connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
