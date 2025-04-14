import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './tasks/task.module';
import { MonitorModule } from './monitor/monitor.module';

import { configurations } from '../../../configs';
import { DatabaseModule } from '../../../database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...configurations],
      isGlobal: true,
    }),
    DatabaseModule,
    TaskModule,
    MonitorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
