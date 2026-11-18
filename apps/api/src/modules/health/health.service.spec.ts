import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JOB_NAMES } from '@journalpilot/shared';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;
  const systemQueue = {
    add: vi.fn(),
  };

  beforeEach(async () => {
    systemQueue.add.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getQueueToken('system'),
          useValue: systemQueue,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('returns the API health payload', () => {
    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'journalpilot-api',
    });
  });

  it('queues a health check job', async () => {
    systemQueue.add.mockResolvedValue({ id: 'health-job-1' });

    await expect(service.enqueueHealthCheck()).resolves.toEqual({
      status: 'queued',
      jobId: 'health-job-1',
    });
    expect(systemQueue.add).toHaveBeenCalledWith(
      JOB_NAMES.HEALTH_CHECK,
      expect.objectContaining({ requestedAt: expect.any(String) }),
    );
  });
});
