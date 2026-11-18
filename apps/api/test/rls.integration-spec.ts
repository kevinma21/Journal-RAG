import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../src/database/prisma.service.js';

const userA = '11111111-1111-4111-8111-111111111111';
const userB = '22222222-2222-4222-8222-222222222222';
const journalA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const journalB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const entryA = 'aaaaaaaa-0000-4000-8000-000000000001';
const entryB = 'bbbbbbbb-0000-4000-8000-000000000001';
const conversationA = 'aaaaaaaa-0000-4000-8000-000000000002';
const conversationB = 'bbbbbbbb-0000-4000-8000-000000000002';
const messageA = 'aaaaaaaa-0000-4000-8000-000000000003';
const messageB = 'bbbbbbbb-0000-4000-8000-000000000003';
const embeddingA = 'aaaaaaaa-0000-4000-8000-000000000004';
const embeddingB = 'bbbbbbbb-0000-4000-8000-000000000004';

const runtimeUrl = process.env.DATABASE_URL;
const adminUrl = process.env.RLS_ADMIN_DATABASE_URL;

if (!runtimeUrl || !adminUrl) {
  throw new Error(
    'Run this suite with apps/api/test/run-rls-integration.sh; it provides disposable PostgreSQL URLs.',
  );
}

describe('PostgreSQL RLS through Prisma transactions', () => {
  const prisma = new PrismaService();
  const admin = new Client({ connectionString: adminUrl });

  beforeAll(async () => {
    await admin.connect();
    await admin.query(`INSERT INTO public.users (id) VALUES ($1), ($2)`, [
      userA,
      userB,
    ]);
    await admin.query(
      `INSERT INTO public.journals (id, "userId") VALUES ($1, $2), ($3, $4)`,
      [journalA, userA, journalB, userB],
    );
    await admin.query(
      `INSERT INTO public.journal_entries (id, "journalId", content) VALUES ($1, $2, 'A entry'), ($3, $4, 'B entry')`,
      [entryA, journalA, entryB, journalB],
    );
    await admin.query(
      `INSERT INTO public.conversations (id, "userId", "journalId") VALUES ($1, $2, $3), ($4, $5, $6)`,
      [conversationA, userA, journalA, conversationB, userB, journalB],
    );
    await admin.query(
      `INSERT INTO public.messages (id, "conversationId") VALUES ($1, $2), ($3, $4)`,
      [messageA, conversationA, messageB, conversationB],
    );
    await admin.query(
      `INSERT INTO public.embeddings (id, "entryId") VALUES ($1, $2), ($3, $4)`,
      [embeddingA, entryA, embeddingB, entryB],
    );
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await admin.end();
  });

  it('isolates tenant rows, blocks cross-owner writes, and clears context on a reused pooled connection', async () => {
    const ownRows = await prisma.withUserContext(userA, async (tx) => {
      const pid = await tx.$queryRaw<{ pid: number }[]>`
        SELECT pg_catalog.pg_backend_pid() AS pid
      `;
      const journals = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.journals ORDER BY id
      `;
      const entries = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.journal_entries ORDER BY id
      `;
      const conversations = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.conversations ORDER BY id
      `;
      const messages = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.messages ORDER BY id
      `;
      const embeddings = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.embeddings ORDER BY id
      `;

      const updated = await tx.$executeRaw`
        UPDATE public.journal_entries
        SET content = 'unauthorized update'
        WHERE id = ${entryB}::uuid
      `;
      const deleted = await tx.$executeRaw`
        DELETE FROM public.journal_entries WHERE id = ${entryB}::uuid
      `;

      return {
        pid: pid[0].pid,
        journals,
        entries,
        conversations,
        messages,
        embeddings,
        updated,
        deleted,
      };
    });

    expect(ownRows.journals.map((row) => row.id)).toEqual([journalA]);
    expect(ownRows.entries.map((row) => row.id)).toEqual([entryA]);
    expect(ownRows.conversations.map((row) => row.id)).toEqual([conversationA]);
    expect(ownRows.messages.map((row) => row.id)).toEqual([messageA]);
    expect(ownRows.embeddings.map((row) => row.id)).toEqual([embeddingA]);
    expect(ownRows.updated).toBe(0);
    expect(ownRows.deleted).toBe(0);

    await expect(
      prisma.withUserContext(
        userA,
        (tx) =>
          tx.$executeRaw`
          INSERT INTO public.journal_entries (id, "journalId", content)
          VALUES (gen_random_uuid(), ${journalB}::uuid, 'cross-tenant insert')
        `,
      ),
    ).rejects.toThrow();

    await expect(
      prisma.withUserContext(
        userA,
        (tx) =>
          tx.$executeRaw`
          UPDATE public.journal_entries
          SET "journalId" = ${journalB}::uuid
          WHERE id = ${entryA}::uuid
        `,
      ),
    ).rejects.toThrow();

    const outsideTransaction = await prisma.$queryRaw<
      {
        pid: number;
        user_id: string | null;
        journals: bigint;
        entries: bigint;
        conversations: bigint;
        messages: bigint;
        embeddings: bigint;
      }[]
    >`
      SELECT
        pg_catalog.pg_backend_pid() AS pid,
        pg_catalog.current_setting('journalpilot.user_id', true) AS user_id,
        (SELECT count(*) FROM public.journals) AS journals,
        (SELECT count(*) FROM public.journal_entries) AS entries,
        (SELECT count(*) FROM public.conversations) AS conversations,
        (SELECT count(*) FROM public.messages) AS messages,
        (SELECT count(*) FROM public.embeddings) AS embeddings
    `;

    expect(outsideTransaction[0]).toMatchObject({
      journals: 0n,
      entries: 0n,
      conversations: 0n,
      messages: 0n,
      embeddings: 0n,
    });

    const backendAfterTransaction = await prisma.$queryRaw<
      { pid: number; user_id: string | null; resolved_user_id: string | null }[]
    >`
      SELECT
        pg_catalog.pg_backend_pid() AS pid,
        pg_catalog.current_setting('journalpilot.user_id', true) AS user_id,
        journalpilot_private.current_user_id()::text AS resolved_user_id
    `;

    expect(backendAfterTransaction[0].pid).toBe(ownRows.pid);
    expect(backendAfterTransaction[0].user_id).not.toBe(userA);
    expect(backendAfterTransaction[0].resolved_user_id).toBeNull();

    const userBRows = await prisma.withUserContext(userB, async (tx) => {
      const journals = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.journals ORDER BY id
      `;
      const entries = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.journal_entries ORDER BY id
      `;
      return { journals, entries };
    });
    expect(userBRows.journals.map((row) => row.id)).toEqual([journalB]);
    expect(userBRows.entries.map((row) => row.id)).toEqual([entryB]);
  });

  it('does not leak context when different users share a single pooled connection', async () => {
    const results = await Promise.all([
      prisma.withUserContext(userA, async (tx) => {
        return tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM public.journals ORDER BY id
        `;
      }),
      prisma.withUserContext(userB, async (tx) => {
        return tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM public.journals ORDER BY id
        `;
      }),
    ]);

    expect(results[0].map((row) => row.id)).toEqual([journalA]);
    expect(results[1].map((row) => row.id)).toEqual([journalB]);
  });
});
