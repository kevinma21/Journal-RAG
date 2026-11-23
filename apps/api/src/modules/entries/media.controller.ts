import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { reserveMediaUploadSchema } from '@journalpilot/validation';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { MediaService } from './media.service.js';

@ApiTags('Entry media')
@ApiBearerAuth()
@Controller({ version: '1' })
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('journals/:journalId/media-uploads')
  @Header('Cache-Control', 'no-store')
  reserve(
    @CurrentUser() user: User,
    @Param('journalId', ParseUUIDPipe) journalId: string,
    @Body() body: unknown,
  ) {
    const result = reserveMediaUploadSchema.safeParse(body);
    if (!result.success)
      throw new BadRequestException(
        result.error.issues.map(({ message }) => message),
      );
    return this.media.reserve(user.id, journalId, result.data);
  }

  @Post('media-uploads/:uploadId/finalize')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  finalize(
    @CurrentUser() user: User,
    @Param('uploadId', ParseUUIDPipe) uploadId: string,
  ) {
    return this.media.finalize(user.id, uploadId);
  }

  @Delete('media-uploads/:uploadId')
  @HttpCode(204)
  cancel(
    @CurrentUser() user: User,
    @Param('uploadId', ParseUUIDPipe) uploadId: string,
  ) {
    return this.media.cancel(user.id, uploadId);
  }

  @Get('entries/:entryId/media')
  @Header('Cache-Control', 'no-store')
  list(
    @CurrentUser() user: User,
    @Param('entryId', ParseUUIDPipe) entryId: string,
  ) {
    return this.media.list(user.id, entryId);
  }
}
