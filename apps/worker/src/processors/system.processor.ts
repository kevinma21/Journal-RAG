import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('system')
export class SystemProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemProcessor.name);

  async process(job: Job): Promise<unknown> {
    this.logger.log(
      `Processing job ${job.id}: ${job.name}`,
    );

    if (job.name === 'health-check') {
      const result = {
        status: 'ok',
        processedAt: new Date().toISOString(),
      };

      this.logger.log(
        `Health check completed for job ${job.id}`,
      );

      return result;
    }

    throw new Error(`Unknown job type: ${job.name}`);
  }
}