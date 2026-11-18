import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@supabase/supabase-js';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user identity' })
  @ApiOkResponse({
    description: 'Identity derived from the verified Supabase access token.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email', nullable: true },
      },
    },
  })
  getCurrentUser(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email ?? null,
    };
  }
}
