import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaCleanupProcessor } from './processors/media-cleanup.processor.js';
import { SystemProcessor } from './processors/system.processor.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
        return {
          connection: {
            host: url.hostname,
            port: Number(
              url.port || (url.protocol === 'rediss:' ? 6380 : 6379),
            ),
            username: url.username || undefined,
            password: url.password || undefined,
            db:
              url.pathname.length > 1
                ? Number(url.pathname.slice(1))
                : undefined,
            tls: url.protocol === 'rediss:' ? {} : undefined,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: 'system' }, { name: 'media-cleanup' }),
  ],
  providers: [SystemProcessor, MediaCleanupProcessor],
})
export class AppModule {}
