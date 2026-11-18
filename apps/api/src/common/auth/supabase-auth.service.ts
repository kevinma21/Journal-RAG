import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthService {
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl) {
      throw new InternalServerErrorException(
        'Missing SUPABASE_URL configuration',
      );
    }

    if (!supabaseKey) {
      throw new InternalServerErrorException(
        'Missing SUPABASE_PUBLISHABLE_KEY configuration',
      );
    }

    this.supabaseUrl = supabaseUrl.replace(/\/$/, '');
    this.supabaseKey = supabaseKey;
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: this.supabaseKey,
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          data: { user: null },
          error: new Error(`Supabase auth returned HTTP ${response.status}`),
        };
      }

      return {
        data: { user: (await response.json()) as User },
        error: null,
      };
    } catch (error) {
      return {
        data: { user: null },
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
