/**
 * Interface for task handlers
 * Each task type should implement this interface
 */
export interface TaskHandler {
  /**
   * Execute the task
   * @param payload The task payload
   * @param taskId The task ID
   * @returns A promise that resolves when the task is complete
   */
  execute(payload: any, taskId: string): Promise<void>;
}

/**
 * Type for the task handler registry
 * Maps task names to handler implementations
 */
export type TaskHandlerRegistry = Map<string, TaskHandler>;
