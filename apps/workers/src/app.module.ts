import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '@app/logger';

import { WorkerModule } from './worker/worker.module';

import { configurations } from '../../../configs';
import { DatabaseModule } from '../../../database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...configurations],
      isGlobal: true,
    }),
    LoggerModule,
    DatabaseModule,
    WorkerModule,
  ],
})
export class AppModule {}
