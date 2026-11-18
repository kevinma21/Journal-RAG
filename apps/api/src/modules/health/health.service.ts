import { Injectable } from '@nestjs/common';
import { JOB_NAMES } from '@journalpilot/shared';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'journalpilot-api',
    };
  }

  async enqueueHealthCheck() {
    const { Queue } = await import('bullmq');
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    const url = new URL(redisUrl);
    const database = url.pathname.slice(1);
    const queue = new Queue('system', {
      connection: {
        host: url.hostname,
        port: Number(url.port || (url.protocol === 'rediss:' ? 6380 : 6379)),
        username: url.username || undefined,
        password: url.password || undefined,
        db: database ? Number(database) : undefined,
        tls: url.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: null,
      },
    });

    try {
      const job = await queue.add(JOB_NAMES.HEALTH_CHECK, {
        requestedAt: new Date().toISOString(),
      });

      return {
        status: 'queued',
        jobId: job.id,
      };
    } finally {
      await queue.close();
    }
  }
}
