import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const mediaBucket = 'journal-media';
export const readUrlSeconds = 300;

@Injectable()
export class MediaStorage {
  private client?: SupabaseClient;

  get bucket(): ReturnType<SupabaseClient['storage']['from']> {
    const url = process.env.SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) {
      throw new ServiceUnavailableException('Media storage is unavailable');
    }
    this.client ??= createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: init?.signal
              ? AbortSignal.any([init.signal, AbortSignal.timeout(20_000)])
              : AbortSignal.timeout(20_000),
          }),
      },
    });
    return this.client.storage.from(mediaBucket);
  }
}
