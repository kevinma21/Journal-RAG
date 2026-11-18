import { Module } from '@nestjs/common';

import { AuthModule } from './common/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { DatabaseModule } from './database/database.module.js';
import { JournalsModule } from './modules/journals/journals.module.js';
import { EntriesModule } from './modules/entries/entries.module.js';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    HealthModule,
    JournalsModule,
    EntriesModule,
    UsersModule,
  ],
})
export class AppModule {}
