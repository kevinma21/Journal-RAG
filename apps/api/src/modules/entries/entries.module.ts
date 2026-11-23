import { Module } from '@nestjs/common';

import { EntriesController } from './entries.controller.js';
import { EntriesService } from './entries.service.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { MediaStorage } from './media-storage.js';

@Module({
  controllers: [EntriesController, MediaController],
  providers: [EntriesService, MediaService, MediaStorage],
})
export class EntriesModule {}
