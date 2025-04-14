import { Injectable, OnModuleInit } from '@nestjs/common';

import { LoggerService } from '@app/logger';

import { TaskType } from '../../../../../common/enums/tasks.enum';
import { TaskHandler } from '../task-handler.interface';
import { TaskRegistryService } from '../task-registry.service';

/**
 * Sample task handler implementation
 * This is an example of how to implement a task handler
 */
@Injectable()
export class SampleTaskHandler implements TaskHandler, OnModuleInit {
  // Task name constant - use this when submitting tasks via the API
  static readonly TASK_NAME = TaskType.SAMPLE_TASK;

  constructor(
    private readonly logger: LoggerService,
    private readonly taskRegistry: TaskRegistryService,
  ) {}

  /**
   * Register this handler with the task registry on module init
   */
  onModuleInit(): void {
    this.taskRegistry.register(SampleTaskHandler.TASK_NAME, this);
    this.logger.info(
      'TASK_HANDLER',
      `Registered handler for task type: ${SampleTaskHandler.TASK_NAME}`,
      {},
    );
  }

  /**
   * Execute the task
   * @param payload The task payload
   * @param taskId The task ID
   */
  async execute(payload: Record<string, unknown>, taskId: string): Promise<void> {
    this.logger.info(
      'TASK_HANDLER',
      `Executing sample task: ${taskId}`,
      { taskId, payload },
    );

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example of how to access payload properties
    const message = payload.message || 'No message provided';

    this.logger.info(
      'TASK_HANDLER',
      `Sample task completed: ${taskId}, Message: ${message}`,
      { taskId, message },
    );
  }
}
