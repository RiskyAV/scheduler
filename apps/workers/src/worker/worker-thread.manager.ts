import { join } from 'path';
import { Worker } from 'worker_threads';

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@app/logger';

import { WorkerService } from './worker.service';

import { TaskEventType, TaskType } from '../../../../common/enums/tasks.enum';

@Injectable()
export class WorkerThreadManager {
  private workers: Map<string, Worker> = new Map();
  private workerService: any;

  constructor(private readonly logger: LoggerService) {}

  /**
   * Set the worker service instance
   * This is needed to avoid circular dependency issues
   * @param workerService The worker service instance
   */
  setWorkerService(workerService: WorkerService): void {
    this.workerService = workerService;
  }

  /**
   * Run a task in a worker thread
   * @returns A promise that resolves when the worker thread completes
   * @param taskId
   * @param taskName
   * @param type
   * @param payload
   */
  async runInWorkerThread(taskId: string, taskName: string, type: TaskType, payload: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      // Create a unique ID for this worker
      const workerId = `${taskName}-${taskId}-${Date.now()}`;

      // Create a new worker thread
      const worker = new Worker(join(__dirname, 'worker-thread.js'), {
        workerData: {
          taskId,
          taskName,
          type,
          payload,
        }
      });

      // Store the worker in the map
      this.workers.set(workerId, worker);

      // Handle messages from the worker
      worker.on('message', async (message) => {
        if (message.type === 'execute') {
          try {
            const task = await this.workerService.getTaskById(taskId);
            if (!task) {
              throw new Error(`Task not found: ${taskId}`);
            }

            await this.workerService.processTask(task);

            const result = { success: true };

            // Send the result back to the worker
            worker.postMessage({
              type: 'result',
              data: result
            });
          } catch (error) {
            await this.workerService.createTaskEvent(
                taskId,
                TaskEventType.FAILED,
                'Task failed',
                error,
            );

            // Send the error back to the worker
            worker.postMessage({
              type: 'error',
              error: error.message
            });
          }
        } else if (message.type === 'complete') {
          // Worker has completed the task
          this.workers.delete(workerId);
          worker.terminate();
          resolve(message.data);
        } else if (message.type === 'error') {
          // Worker encountered an error
          this.workers.delete(workerId);
          worker.terminate();
          this.logger.error('WORKER_THREAD', `Worker thread error: ${message.error}`, {
            workerId,
            error: message.error,
            stack: message.stack,
          });
          reject(new Error(message.error));
        }
      });

      // Handle errors from the worker
      worker.on('error', (error) => {
        this.workers.delete(workerId);
        worker.terminate();
        this.logger.error('WORKER_THREAD', `Worker thread error: ${error.message}`, {
          workerId,
          error: error.message,
          stack: error.stack,
        });
        reject(error);
      });

      // Handle worker exit
      worker.on('exit', (code) => {
        this.workers.delete(workerId);
        if (code !== 0) {
          const error = new Error(`Worker thread exited with code ${code}`);
          this.logger.error('WORKER_THREAD', `Worker thread exited with code ${code}`, {
            workerId,
            exitCode: code,
          });
          reject(error);
        }
      });
    });
  }

  /**
   * Run multiple tasks in parallel worker threads
   * @param dataArray An array of data to pass to the worker threads
   * @param dataArray.taskId The ID of the task
   * @param dataArray.taskName The name of the task
   * @param dataArray.type The type of task
   * @param dataArray.payload The payload to pass to the worker thread
   * @returns A promise that resolves when all worker threads complete
   */
  async runAllInWorkerThreads(dataArray: { taskId: string, taskName: string, type: TaskType, payload: Record<string, unknown> }[]): Promise<unknown[]> {
    return Promise.all(
      dataArray.map(data => this.runInWorkerThread(data.taskId, data.taskName, data.type, data.payload))
    );
  }
}
