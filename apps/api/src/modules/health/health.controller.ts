import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard.js';
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

  @Get('authenticated')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check authenticated API access',
    description:
      'Verifies that the request contains a valid Supabase access token.',
  })
  @ApiOkResponse({
    description: 'Authenticated request accepted.',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        authenticated: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired access token.',
  })
  getAuthenticated() {
    return {
      status: 'ok',
      authenticated: true,
    };
  }
}
