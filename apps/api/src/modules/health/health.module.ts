import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { AuthModule } from '../../common/auth/auth.module.js';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'system',
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
