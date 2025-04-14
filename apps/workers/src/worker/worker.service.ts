import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import { LoggerService } from '@app/logger';

import { TaskRegistryService } from './task-registry.service';
import { WorkerThreadManager } from './worker-thread.manager';

import { ConfigKey } from '../../../../common/enums/config.enum';
import { TaskStatus, TaskEventType } from '../../../../common/enums/tasks.enum';
import { Task } from '../../../../database/entities/task.entity';
import { TaskEventRepository } from '../../../../database/repositories/task-event.repository';
import { TaskRepository } from '../../../../database/repositories/task.repository';


@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly workerId: string;
  private readonly pollingInterval: number;
  private readonly maxConcurrentTasks: number;
  private readonly retryBaseDelay: number;
  private isPolling = false;

  constructor(
    @Inject(ConfigKey.SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly taskRepository: TaskRepository,
    private readonly logger: LoggerService,
    private readonly taskRegistry: TaskRegistryService,
    private readonly taskEventRepository: TaskEventRepository,
    private readonly workerThreadManager: WorkerThreadManager,
  ) {
    // Generate a unique worker ID
    this.workerId = process.env.WORKER_ID || `worker-${uuidv4()}`;

    // Load configuration
    this.pollingInterval =
      parseInt(process.env.WORKER_POLLING_INTERVAL_MS || '5000', 10);
    this.maxConcurrentTasks =
      parseInt(process.env.WORKER_MAX_CONCURRENT_TASKS || '10', 10);
    this.retryBaseDelay =
      parseInt(process.env.RETRY_BASE_DELAY_MS || '60000', 10);

    this.logger.info('WORKER', `Worker initialized with ID: ${this.workerId}`, {
      workerId: this.workerId,
      pollingInterval: this.pollingInterval,
      maxConcurrentTasks: this.maxConcurrentTasks,
    });
  }

  async onModuleInit(): Promise<void> {
    // Set this service instance in the worker thread manager
    this.workerThreadManager.setWorkerService(this);

    // Start polling for tasks
    this.startPolling();
  }

  /**
   * Get a task by ID
   * @param taskId The ID of the task
   * @returns The task or null if not found
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      return await this.taskRepository.getById(taskId);
    } catch (error) {
      this.logger.error('WORKER', `Failed to get task by ID: ${taskId}`, {
        workerId: this.workerId,
        taskId,
        error: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  /**
   * Start polling for tasks
   */
  startPolling(): void {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.logger.info('WORKER', 'Started polling for tasks', { workerId: this.workerId });

    this.poll();
  }

  /**
   * Stop polling for tasks
   */
  stopPolling(): void {
    this.isPolling = false;
    this.logger.info('WORKER', 'Stopped polling for tasks', { workerId: this.workerId });
  }

  /**
   * Poll for tasks and process them
   */
  private async poll() {
    if (!this.isPolling) {
      return;
    }

    try {
      // Acquire and process tasks
      await this.acquireAndProcessTasks();
    } catch (error) {
      this.logger.error('WORKER', 'Error polling for tasks', {
        workerId: this.workerId,
        error: error.message,
        stack: error.stack,
      });
    }

    // Schedule next poll
    setTimeout(() => this.poll(), this.pollingInterval);
  }

  /**
   * Acquire and process tasks
   */
  private async acquireAndProcessTasks() {
    const transaction = await this.sequelize.transaction();

    try {
      // Find and lock tasks
      const tasks = await this.taskRepository.get({
        [Op.or]: [
          {
            status: TaskStatus.PENDING,
            scheduledAt: { [Op.lte]: new Date() },
          },
          {
            status: TaskStatus.FAILED,
            nextRetryAt: { [Op.lte]: new Date() },
            retryCount: { [Op.lt]: this.sequelize.col('max_retries') },
          },
        ],
      },
      {
        order: [
          ['priority', 'ASC'],
          ['scheduled_at', 'ASC'],
        ],
        pagination: {
          limit: this.maxConcurrentTasks
        },
        lock: {
            level: Transaction.LOCK.UPDATE,
            of: this.taskRepository,
        }
      }
    );

      if (tasks.length === 0) {
        await transaction.commit();
        return;
      }

      // Update tasks to processing state
      const now = new Date();
      await Promise.all(
        tasks.map(task =>
          task.update(
            {
              status: TaskStatus.PROCESSING,
              locked_by: this.workerId,
              locked_at: now,
            },
            { transaction }
          )
        )
      );

      // Commit the transaction to release the lock
      await transaction.commit();

      // Process tasks in parallel in separate worker threads
      await this.workerThreadManager.runAllInWorkerThreads(
        tasks.map(task => ({
          taskId: task.id,
          taskName: task.taskName,
          type: task.type,
          payload: task.payload
        }))
      );
    } catch (error) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Create a task event
   * @param taskId The ID of the task
   * @param eventType The type of event
   * @param message Optional message
   * @param metadata Optional metadata
   */
  private async createTaskEvent(
    taskId: string,
    eventType: TaskEventType,
    message?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.taskEventRepository.create({
        taskId,
        eventType,
        message,
        metadata: metadata || {},
      });

      this.logger.debug('WORKER', `Created task event: ${eventType} for task: ${taskId}`, {
        workerId: this.workerId,
        taskId,
        eventType,
      });
    } catch (error) {
      this.logger.error('WORKER', `Failed to create task event: ${eventType} for task: ${taskId}`, {
        workerId: this.workerId,
        taskId,
        eventType,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Process a single task
   * @param task The task to process
   */
  private async processTask(task: Task) {
    this.logger.info('WORKER', `Processing task: ${task.id}`, {
      workerId: this.workerId,
      taskId: task.id,
      taskName: task.taskName,
    });

    // Create LOCKED event
    await this.createTaskEvent(
      task.id,
      TaskEventType.LOCKED,
      `Task locked by worker: ${this.workerId}`,
      { workerId: this.workerId }
    );

    // Create STARTED event
    await this.createTaskEvent(task.id, TaskEventType.STARTED, 'Task started', { workerId: this.workerId });

    try {
      // Check if a handler exists for this task
      if (!this.taskRegistry.hasHandler(task.type)) {
        throw new Error(`No handler registered for task type: ${task.type}`);
      }

      // Get the handler and execute the task
      const handler = this.taskRegistry.getHandler(task.type);
      if (!handler) {
        throw new Error(`Handler not found for task type: ${task.type}`);
      }
      await handler.execute(task.payload, task.id);

      // Update task status to completed
      await task.update({
        status: TaskStatus.COMPLETED,
        lockedBy: null,
        lockedAt: null,
      });

      // Create SUCCEEDED event
      await this.createTaskEvent(task.id, TaskEventType.SUCCEEDED, 'Task completed successfully', { workerId: this.workerId });

      this.logger.info('WORKER', `Task completed: ${task.id}`, {
        workerId: this.workerId,
        taskId: task.id,
        taskName: task.taskName,
      });
    } catch (error) {
      this.logger.error('WORKER', `Task failed: ${task.id}`, {
        workerId: this.workerId,
        taskId: task.id,
        taskName: task.taskName,
        error: error.message,
        stack: error.stack,
      });

      // Calculate retry information
      const retryCount = task.retryCount + 1;
      const hasRetriesLeft = retryCount < task.maxRetries;

      const baseDelay = this.retryBaseDelay;
      const nextRetryAt = new Date(Date.now() + baseDelay);

      // Update the task with failure information
      await task.update({
        status: TaskStatus.FAILED,
        retryCount: retryCount,
        lastError: error.message,
        nextRetryAt: hasRetriesLeft ? nextRetryAt : null,
        lockedBy: null,
        lockedAt: null,
      });

      // Create FAILED event
      await this.createTaskEvent(
        task.id,
        TaskEventType.FAILED,
        error.message,
        {
          retryCount,
          hasRetriesLeft,
          nextRetryAt: hasRetriesLeft ? nextRetryAt.toISOString() : null,
          error,
          workerId: this.workerId,
        }
      );

      if (!hasRetriesLeft) {
        this.logger.warn('WORKER', `Task has exhausted all retries: ${task.id}`, {
          workerId: this.workerId,
          taskId: task.id,
          taskName: task.taskName,
          maxRetries: task.maxRetries,
        });
      }
    }
  }
}
