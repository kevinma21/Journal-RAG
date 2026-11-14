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
import type { User } from '@supabase/supabase-js';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
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
      'Verifies the Supabase access token and returns the authenticated user identity.',
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
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'ff936075-81b5-4e93-bb7b-5bd0189453c0',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired access token.',
  })
  getAuthenticated(@CurrentUser() user: User) {
    return {
      status: 'ok',
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}