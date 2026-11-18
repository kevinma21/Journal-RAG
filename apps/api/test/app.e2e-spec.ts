import { afterAll, beforeAll, beforeEach, describe, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { VersioningType, type INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import { AuthModule } from '../src/common/auth/auth.module.js';
import { SupabaseAuthService } from '../src/common/auth/supabase-auth.service.js';
import { HealthController } from '../src/modules/health/health.controller.js';
import { HealthService } from '../src/modules/health/health.service.js';
import { UsersController } from '../src/modules/users/users.controller.js';

describe('API authentication (e2e)', () => {
  let app: INestApplication<App>;
  let baseUrl: string;
  const user = {
    id: 'f0cc6ec4-11d2-4be8-8d6c-2dbe8187d4c8',
    email: 'member@example.com',
  };
  const authService = {
    verifyAccessToken: vi.fn(),
  };
  const healthService = {
    getHealth: vi.fn().mockReturnValue({
      status: 'ok',
      service: 'journalpilot-api',
    }),
    enqueueHealthCheck: vi.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [HealthController, UsersController],
      providers: [{ provide: HealthService, useValue: healthService }],
    })
      .overrideProvider(SupabaseAuthService)
      .useValue(authService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  beforeEach(() => {
    authService.verifyAccessToken.mockReset();
    authService.verifyAccessToken.mockImplementation(async (token: string) => {
      if (token === 'valid-test-token') {
        return { data: { user }, error: null };
      }

      return {
        data: { user: null },
        error: { message: 'Invalid or expired token' },
      };
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps the public health route accessible', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      service: 'journalpilot-api',
    });
  });

  it('rejects protected routes without a valid bearer token', async () => {
    const missingToken = await fetch(`${baseUrl}/api/v1/users/me`);
    const expiredToken = await fetch(`${baseUrl}/api/v1/users/me`, {
      headers: { Authorization: 'Bearer expired-test-token' },
    });
    expect(missingToken.status).toBe(401);
    expect(expiredToken.status).toBe(401);
  });

  it('returns the authenticated identity for a valid bearer token', async () => {
    const response = await fetch(`${baseUrl}/api/v1/users/me`, {
      headers: { Authorization: 'Bearer valid-test-token' },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(user);
  });
});
