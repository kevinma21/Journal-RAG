import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@supabase/supabase-js';
import {
  createJournalSchema,
  updateJournalSchema,
} from '@journalpilot/validation';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { JournalsService } from './journals.service.js';

function validateBody<T>(
  schema: {
    safeParse: (
      input: unknown,
    ) =>
      | { success: true; data: T }
      | { success: false; error: { issues: readonly { message: string }[] } };
  },
  input: unknown,
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues.map((issue) => issue.message),
    );
  }
  return result.data as T;
}

@ApiTags('Journals')
@ApiBearerAuth()
@Controller({ path: 'journals', version: '1' })
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Get()
  @ApiOperation({ summary: 'List the authenticated user’s active journals' })
  @ApiOkResponse({ description: 'Journals owned by the authenticated user.' })
  list(@CurrentUser() user: User) {
    return this.journalsService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a journal for the authenticated user' })
  @ApiCreatedResponse({ description: 'The created journal.' })
  create(@CurrentUser() user: User, @Body() input: unknown) {
    const body = validateBody(createJournalSchema, input);
    return this.journalsService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename or update a journal description' })
  @ApiOkResponse({ description: 'The updated journal.' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: unknown,
  ) {
    const body = validateBody(updateJournalSchema, input);
    return this.journalsService.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Move a journal to the deleted state' })
  @ApiNoContentResponse({ description: 'The journal was deleted.' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.journalsService.remove(user.id, id);
  }
}
