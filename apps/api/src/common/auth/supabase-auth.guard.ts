import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { SupabaseAuthService } from './supabase-auth.service.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const accessToken = authorization.slice('Bearer '.length).trim();

    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    const { data, error } =
      await this.supabaseAuthService.verifyAccessToken(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.user = data.user;

    return true;
  }
}