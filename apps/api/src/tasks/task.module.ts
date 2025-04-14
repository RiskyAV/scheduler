import { Module } from '@nestjs/common';

import { TaskController } from './task.controller';
import { TaskService } from './task.service';

import { taskProvider } from '../../../../database/entities/entities.providers';
import { TaskRepository } from '../../../../database/repositories/task.repository';

@Module({
  controllers: [
    TaskController,
  ],
  providers: [
    TaskService,

    TaskRepository,

    ...taskProvider,
  ],
})
export class TaskModule {}
