import { Global, Module } from '@nestjs/common';

import { LoggerModule } from '@app/logger';

import { databaseProviders } from './database.providers';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [...databaseProviders, DatabaseService],
  exports: [...databaseProviders],
  imports: [LoggerModule],
})
export class DatabaseModule {}
