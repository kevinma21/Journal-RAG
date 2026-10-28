import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    HealthModule,
  ],
})
export class AppModule {}