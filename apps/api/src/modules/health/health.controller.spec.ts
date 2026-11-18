import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  const healthService = {
    getHealth: vi.fn(),
    enqueueHealthCheck: vi.fn(),
  };

  beforeEach(async () => {
    healthService.getHealth.mockReset();
    healthService.enqueueHealthCheck.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('delegates the health check to the service', () => {
    const health = { status: 'ok', service: 'journalpilot-api' };
    healthService.getHealth.mockReturnValue(health);

    expect(controller.getHealth()).toEqual(health);
    expect(healthService.getHealth).toHaveBeenCalledOnce();
  });

  it('delegates health check jobs to the service', async () => {
    const queued = { status: 'queued', jobId: 'health-job-1' };
    healthService.enqueueHealthCheck.mockResolvedValue(queued);

    await expect(controller.enqueueHealthCheck()).resolves.toEqual(queued);
    expect(healthService.enqueueHealthCheck).toHaveBeenCalledOnce();
  });
});
