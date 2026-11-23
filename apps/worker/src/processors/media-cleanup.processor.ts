import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import {
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Job, Queue } from 'bullmq';
import { Pool } from 'pg';

const queueName = 'media-cleanup';

@Processor(queueName)
export class MediaCleanupProcessor
  extends WorkerHost
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(MediaCleanupProcessor.name);
  private pool?: Pool;
  private storage?: SupabaseClient;

  constructor(@InjectQueue(queueName) private readonly queue: Queue) {
    super();
  }

  async onApplicationBootstrap() {
    const connectionString = process.env.MEDIA_CLEANUP_DATABASE_URL;
    const url = process.env.SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!connectionString) return;
    if (!url || !secret)
      throw new Error('Media cleanup requires Supabase Storage configuration');

    this.pool = new Pool({
      connectionString,
      max: 2,
      connectionTimeoutMillis: 5_000,
    });
    this.storage = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }),
      },
    });
    await this.queue.upsertJobScheduler(
      queueName,
      { every: 60_000 },
      {
        name: queueName,
        opts: { removeOnComplete: 20, removeOnFail: 50 },
      },
    );
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  async process(job: Job): Promise<{ removed: number }> {
    const { pool, storage } = this;
    if (!pool || !storage) throw new Error('Media cleanup is not configured');
    if (job.name !== queueName) throw new Error('Unknown media cleanup job');

    await pool.query(`
      UPDATE public.media_uploads SET state = 'CLEANUP_PENDING',
        "nextCleanupAt" = GREATEST(now(), "uploadTokenValidUntil")
      WHERE state IN ('PENDING', 'READY') AND "expiresAt" <= now()
    `);

    const { rows } = await pool.query<{ id: string; storagePath: string }>(`
      WITH due AS (
        SELECT id FROM public.media_uploads
        WHERE state = 'CLEANUP_PENDING' AND "nextCleanupAt" <= now()
          AND "uploadTokenValidUntil" <= now()
        ORDER BY "nextCleanupAt"
        LIMIT 20 FOR UPDATE SKIP LOCKED
      )
      UPDATE public.media_uploads AS uploads
      SET "nextCleanupAt" = now() + interval '10 minutes'
      FROM due WHERE uploads.id = due.id
      RETURNING uploads.id, uploads."storagePath"
    `);

    let removed = 0;
    for (const row of rows) {
      try {
        const result = await storage.storage
          .from('journal-media')
          .remove([row.storagePath]);
        if (result.error) throw result.error;
        const deleted = await pool.query(
          'DELETE FROM public.media_uploads WHERE id = $1',
          [row.id],
        );
        removed += deleted.rowCount ?? 0;
      } catch {
        this.logger.warn(`Media cleanup will retry for reservation ${row.id}`);
      }
    }
    return { removed };
  }
}
