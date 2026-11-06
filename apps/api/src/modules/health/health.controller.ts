import { Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthService } from './health.service.js';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Check API health',
    description: 'Returns the current health status of the JournalPilot API.',
  })
  @ApiOkResponse({
    description: 'API is healthy.',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        service: {
          type: 'string',
          example: 'journalpilot-api',
        },
      },
    },
  })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Post('queue')
  async enqueueHealthCheck() {
    return this.healthService.enqueueHealthCheck();
  }
}
