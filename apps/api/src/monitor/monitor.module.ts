import { Module } from '@nestjs/common';

import { LoggerModule } from '@app/logger';

import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';

import { taskProvider } from '../../../../database/entities/entities.providers';
import { TaskRepository } from '../../../../database/repositories/task.repository';

@Module({
  imports: [
    LoggerModule,
  ],
  controllers: [
    MonitorController,
  ],
  providers: [
    MonitorService,
    TaskRepository,
    ...taskProvider,
  ],
})
export class MonitorModule {}
