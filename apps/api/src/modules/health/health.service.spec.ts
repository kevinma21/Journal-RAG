import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JOB_NAMES } from '@journalpilot/shared';
import { HealthService } from './health.service.js';

const { queueAdd, queueClose } = vi.hoisted(() => ({
  queueAdd: vi.fn(),
  queueClose: vi.fn(),
}));

vi.mock('bullmq', () => ({
  Queue: vi.fn(function MockQueue() {
    return { add: queueAdd, close: queueClose };
  }),
}));

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    queueAdd.mockReset();
    queueClose.mockReset();
    service = new HealthService();
  });

  it('returns the API health payload', () => {
    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'journalpilot-api',
    });
  });

  it('queues a health check job', async () => {
    queueAdd.mockResolvedValue({ id: 'health-job-1' });
    queueClose.mockResolvedValue(undefined);

    await expect(service.enqueueHealthCheck()).resolves.toEqual({
      status: 'queued',
      jobId: 'health-job-1',
    });
    expect(queueAdd).toHaveBeenCalledWith(
      JOB_NAMES.HEALTH_CHECK,
      expect.objectContaining({ requestedAt: expect.any(String) }),
    );
  });
});
