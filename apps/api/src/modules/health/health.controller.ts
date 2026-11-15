import {
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Public } from '../../common/auth/public.decorator.js';
import { HealthService } from './health.service.js';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
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
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired access token.',
  })
  async enqueueHealthCheck() {
    return this.healthService.enqueueHealthCheck();
  }
}