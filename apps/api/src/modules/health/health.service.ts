import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
      'health-check',
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