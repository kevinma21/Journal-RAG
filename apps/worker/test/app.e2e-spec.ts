import { getQueueToken } from '@nestjs/bullmq';
import { NestFactory } from '@nestjs/core';
import { JOB_NAMES } from '@journalpilot/shared';
import { Queue, QueueEvents } from 'bullmq';
import { expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

it('consumes the system health job from the normal worker application', async () => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const queue = app.get<Queue>(getQueueToken('system'));
  const events = new QueueEvents(queue.name, {
    connection: queue.opts.connection,
  });

  try {
    await events.waitUntilReady();
    const job = await queue.add(
      JOB_NAMES.HEALTH_CHECK,
      {},
      { removeOnComplete: 20 },
    );
    await expect(job.waitUntilFinished(events, 10_000)).resolves.toMatchObject({
      status: 'ok',
      processedAt: expect.any(String),
    });
  } finally {
    await events.close();
    await app.close();
  }
});
