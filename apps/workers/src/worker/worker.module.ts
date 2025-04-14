import { Module } from '@nestjs/common';

import { ConsoleLogHandler } from './handlers/concole-log.handler';
import { FailureTestHandler } from './handlers/failure-test.handler';
import { SampleTaskHandler } from './handlers/sample-task.handler';
import { SuccessTestHandler } from './handlers/success-test.handler';
import { TaskRegistryService } from './task-registry.service';
import { WorkerThreadManager } from './worker-thread.manager';
import { WorkerService } from './worker.service';

import { taskEventProvider, taskProvider } from '../../../../database/entities/entities.providers';
import { TaskEventRepository } from '../../../../database/repositories/task-event.repository';
import { TaskRepository } from '../../../../database/repositories/task.repository';

@Module({
  providers: [
    WorkerService,
    TaskRegistryService,
    WorkerThreadManager,

    TaskRepository,
    TaskEventRepository,

    ...taskProvider,
    ...taskEventProvider,

    SampleTaskHandler,
    ConsoleLogHandler,
    SuccessTestHandler,
    FailureTestHandler,
  ],
  exports: [WorkerService],
})
export class WorkerModule {}
