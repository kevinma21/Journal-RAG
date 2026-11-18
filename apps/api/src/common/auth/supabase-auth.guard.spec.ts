import {
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request } from 'express';
import type { User } from '@supabase/supabase-js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';
import type { SupabaseAuthService } from './supabase-auth.service.js';

describe('SupabaseAuthGuard', () => {
  const user = {
    id: 'f0cc6ec4-11d2-4be8-8d6c-2dbe8187d4c8',
    email: 'member@example.com',
  } as User;
  const verifyAccessToken = vi.fn();
  const getAllAndOverride = vi.fn();
  let guard: SupabaseAuthGuard;
  let request: Request;

  function createExecutionContext(): ExecutionContext {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    request = { headers: {} } as Request;
    verifyAccessToken.mockReset();
    getAllAndOverride.mockReset().mockReturnValue(false);
    guard = new SupabaseAuthGuard(
      { verifyAccessToken } as unknown as SupabaseAuthService,
      { getAllAndOverride } as unknown as Reflector,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips authentication only when the route is explicitly public', async () => {
    getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(createExecutionContext())).resolves.toBe(true);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it('rejects a missing or malformed bearer token', async () => {
    await expect(guard.canActivate(createExecutionContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    request.headers.authorization = 'Basic invalid-token';
    await expect(guard.canActivate(createExecutionContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it('rejects invalid or expired tokens', async () => {
    verifyAccessToken.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid or expired token' },
    });
    request.headers.authorization = 'Bearer expired-token';

    await expect(guard.canActivate(createExecutionContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the identity returned by Supabase for a valid bearer token', async () => {
    verifyAccessToken.mockResolvedValue({
      data: { user },
      error: null,
    });
    request.headers.authorization = 'Bearer valid-token';

    await expect(guard.canActivate(createExecutionContext())).resolves.toBe(true);
    expect(request.user).toEqual(user);
    expect(verifyAccessToken).toHaveBeenCalledWith('valid-token');
  });
});
