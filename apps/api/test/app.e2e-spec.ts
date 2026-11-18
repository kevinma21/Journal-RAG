import { afterAll, beforeAll, beforeEach, describe, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { VersioningType, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AuthModule } from '../src/common/auth/auth.module.js';
import { SupabaseAuthService } from '../src/common/auth/supabase-auth.service.js';
import { HealthController } from '../src/modules/health/health.controller.js';
import { HealthService } from '../src/modules/health/health.service.js';
import { UsersController } from '../src/modules/users/users.controller.js';

describe('API authentication (e2e)', () => {
  let app: INestApplication<App>;
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
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok', service: 'journalpilot-api' });
  });

  it('rejects protected routes without a valid bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer expired-test-token')
      .expect(401);
  });

  it('returns the authenticated identity for a valid bearer token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer valid-test-token')
      .expect(200)
      .expect(user);
  });
});
