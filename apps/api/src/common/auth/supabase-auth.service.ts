import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthService {
  private readonly client: SupabaseClient;

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

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  async verifyAccessToken(accessToken: string) {
    return this.client.auth.getUser(accessToken);
  }
}