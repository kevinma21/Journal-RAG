import { Controller, Get, Post } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }

  @Post('queue')
  async enqueueHealthCheck() {
    return this.healthService.enqueueHealthCheck();
  }
}