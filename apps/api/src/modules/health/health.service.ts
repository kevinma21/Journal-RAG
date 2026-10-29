import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_NAMES } from '@journalpilot/shared';

@Injectable()
export class HealthService {
  constructor(
    @InjectQueue('system')
    private readonly systemQueue: Queue,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'journalpilot-api',
    };
  }

  async enqueueHealthCheck() {
    const job = await this.systemQueue.add(
        JOB_NAMES.HEALTH_CHECK,
      {
        requestedAt: new Date().toISOString(),
      },
    );

    return {
      status: 'queued',
      jobId: job.id,
    };
  }
}