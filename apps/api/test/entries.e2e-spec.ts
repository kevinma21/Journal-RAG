import { VersioningType, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { User } from '@supabase/supabase-js';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthModule } from '../src/common/auth/auth.module.js';
import { SupabaseAuthService } from '../src/common/auth/supabase-auth.service.js';
import { EntriesController } from '../src/modules/entries/entries.controller.js';
import { EntriesService } from '../src/modules/entries/entries.service.js';

const userA = { id: 'f0cc6ec4-11d2-4be8-8d6c-2dbe8187d4c8' } as User;
const userB = { id: 'ca63c02e-fc25-4ad5-92a2-513ed2f7e4a8' } as User;
const journalId = '8c949e64-6478-48c1-85ad-bc0ac3786ce2';
const entryId = '07dcb810-42ac-4cb2-a68b-bab68a7a4f3c';
const entry = {
  id: entryId,
  journalId,
  title: 'A memory',
  content: 'Something worth keeping.',
  occurredAt: '2026-11-18T12:00:00.000Z',
  createdAt: '2026-11-18T12:00:00.000Z',
  updatedAt: '2026-11-18T12:00:00.000Z',
  deletedAt: null,
};

describe('Journal entries API (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const authService = { verifyAccessToken: vi.fn() };
  const entriesService = {
    list: vi.fn(),
    listTrash: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    moveToTrash: vi.fn(),
    restore: vi.fn(),
    permanentlyDelete: vi.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [EntriesController],
      providers: [{ provide: EntriesService, useValue: entriesService }],
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
    vi.resetAllMocks();
    authService.verifyAccessToken.mockImplementation(async (token: string) => {
      const user =
        token === 'token-a' ? userA : token === 'token-b' ? userB : null;
      return user
        ? { data: { user }, error: null }
        : { data: { user: null }, error: new Error('Invalid token') };
    });
    entriesService.list.mockResolvedValue({
      data: [entry],
      meta: { pagination: { page: 1, limit: 25, total: 1, totalPages: 1 } },
    });
    entriesService.listTrash.mockResolvedValue({
      data: [entry],
      meta: { pagination: { page: 1, limit: 25, total: 1, totalPages: 1 } },
    });
    entriesService.get.mockResolvedValue({ data: entry });
    entriesService.create.mockResolvedValue({ data: entry });
    entriesService.update.mockResolvedValue({ data: entry });
    entriesService.moveToTrash.mockResolvedValue(undefined);
    entriesService.restore.mockResolvedValue({ data: entry });
    entriesService.permanentlyDelete.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires a valid session before an entry request reaches its handler', async () => {
    const missingToken = await fetch(`${baseUrl}/api/v1/entries/${entryId}`);
    const expiredToken = await fetch(`${baseUrl}/api/v1/entries/${entryId}`, {
      headers: { Authorization: 'Bearer expired-token' },
    });

    expect(missingToken.status).toBe(401);
    expect(expiredToken.status).toBe(401);
    expect(entriesService.get).not.toHaveBeenCalled();
  });

  it('uses the verified identity for lists and never accepts a client userId', async () => {
    const query = new URLSearchParams({
      journalId,
      q: 'memory',
      page: '1',
      limit: '25',
    });
    const listResponse = await fetch(`${baseUrl}/api/v1/entries?${query}`, {
      headers: { Authorization: 'Bearer token-a' },
    });
    expect(listResponse.status).toBe(200);
    expect(entriesService.list).toHaveBeenCalledWith(userA.id, {
      journalId,
      q: 'memory',
      page: 1,
      limit: 25,
    });

    const createResponse = await fetch(`${baseUrl}/api/v1/entries`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        journalId,
        title: 'A memory',
        content: 'Something worth keeping.',
        userId: userB.id,
      }),
    });
    expect(createResponse.status).toBe(201);
    expect(entriesService.create).toHaveBeenCalledWith(
      userA.id,
      expect.objectContaining({
        journalId,
        title: 'A memory',
        content: 'Something worth keeping.',
      }),
    );
    expect(entriesService.create.mock.calls[0][1]).not.toHaveProperty('userId');
  });

  it('routes the entry browse, edit, trash, restore, and permanent-delete flow', async () => {
    const headers = { Authorization: 'Bearer token-a' };
    const detail = await fetch(`${baseUrl}/api/v1/entries/${entryId}`, {
      headers,
    });
    const update = await fetch(`${baseUrl}/api/v1/entries/${entryId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Edited memory.' }),
    });
    const softDelete = await fetch(`${baseUrl}/api/v1/entries/${entryId}`, {
      method: 'DELETE',
      headers,
    });
    const trashQuery = new URLSearchParams({ journalId });
    const trash = await fetch(`${baseUrl}/api/v1/entries/trash?${trashQuery}`, {
      headers,
    });
    const restore = await fetch(
      `${baseUrl}/api/v1/entries/${entryId}/restore`,
      {
        method: 'POST',
        headers,
      },
    );
    const hardDelete = await fetch(
      `${baseUrl}/api/v1/entries/${entryId}/permanent`,
      {
        method: 'DELETE',
        headers,
      },
    );

    expect(detail.status).toBe(200);
    expect(update.status).toBe(200);
    expect(softDelete.status).toBe(204);
    expect(trash.status).toBe(200);
    expect(restore.status).toBe(201);
    expect(hardDelete.status).toBe(204);
    expect(entriesService.get).toHaveBeenCalledWith(userA.id, entryId);
    expect(entriesService.update).toHaveBeenCalledWith(userA.id, entryId, {
      content: 'Edited memory.',
    });
    expect(entriesService.moveToTrash).toHaveBeenCalledWith(userA.id, entryId);
    expect(entriesService.listTrash).toHaveBeenCalledWith(userA.id, {
      journalId,
      page: 1,
      limit: 25,
    });
    expect(entriesService.restore).toHaveBeenCalledWith(userA.id, entryId);
    expect(entriesService.permanentlyDelete).toHaveBeenCalledWith(
      userA.id,
      entryId,
    );
  });
});
