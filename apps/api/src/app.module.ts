import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { AuthModule } from './common/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
        const url = new URL(redisUrl);
        const database = url.pathname.slice(1);

        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || (url.protocol === 'rediss:' ? 6380 : 6379)),
            username: url.username || undefined,
            password: url.password || undefined,
            db: database ? Number(database) : undefined,
            tls: url.protocol === 'rediss:' ? {} : undefined,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    AuthModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
