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
  Query,
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
  createJournalEntrySchema,
  journalEntryListQuerySchema,
  journalEntryTrashQuerySchema,
  updateJournalEntrySchema,
} from '@journalpilot/validation';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { EntriesService } from './entries.service.js';

function validate<T>(
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
  return result.data;
}

@ApiTags('Journal Entries')
@ApiBearerAuth()
@Controller({ path: 'entries', version: '1' })
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get('trash')
  @ApiOperation({ summary: 'List the authenticated user’s trashed entries' })
  @ApiOkResponse({ description: 'A paginated list of entries in Trash.' })
  listTrash(
    @CurrentUser() user: User,
    @Query() query: Record<string, unknown>,
  ) {
    const filters = validate(journalEntryTrashQuerySchema, query);
    return this.entriesService.listTrash(user.id, filters);
  }

  @Get()
  @ApiOperation({ summary: 'List entries in an owned journal' })
  @ApiOkResponse({ description: 'A paginated chronological entry list.' })
  list(@CurrentUser() user: User, @Query() query: Record<string, unknown>) {
    const filters = validate(journalEntryListQuerySchema, query);
    return this.entriesService.list(user.id, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create an entry in an owned journal' })
  @ApiCreatedResponse({ description: 'The created journal entry.' })
  create(@CurrentUser() user: User, @Body() input: unknown) {
    const body = validate(createJournalEntrySchema, input);
    return this.entriesService.create(user.id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View an owned journal entry' })
  @ApiOkResponse({ description: 'The requested journal entry.' })
  get(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.entriesService.get(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an owned journal entry' })
  @ApiOkResponse({ description: 'The updated journal entry.' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: unknown,
  ) {
    const body = validate(updateJournalEntrySchema, input);
    return this.entriesService.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Move an owned journal entry to Trash' })
  @ApiNoContentResponse({ description: 'The entry was moved to Trash.' })
  async moveToTrash(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.entriesService.moveToTrash(user.id, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore an owned journal entry from Trash' })
  @ApiOkResponse({ description: 'The restored journal entry.' })
  restore(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.entriesService.restore(user.id, id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete an entry from Trash' })
  @ApiNoContentResponse({ description: 'The entry was permanently deleted.' })
  async permanentlyDelete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.entriesService.permanentlyDelete(user.id, id);
  }
}
