import { Injectable } from '@nestjs/common';

import { TaskHandler, TaskHandlerRegistry } from './task-handler.interface';

/**
 * Service for registering and retrieving task handlers
 */
@Injectable()
export class TaskRegistryService {
  private readonly registry: TaskHandlerRegistry = new Map();

  /**
   * Register a task handler
   * @param taskName The name of the task
   * @param handler The handler implementation
   */
  register(taskName: string, handler: TaskHandler): void {
    this.registry.set(taskName, handler);
  }

  /**
   * Get a task handler by name
   * @param taskName The name of the task
   * @returns The handler implementation or undefined if not found
   */
  getHandler(taskName: string): TaskHandler | undefined {
    return this.registry.get(taskName);
  }

  /**
   * Check if a handler exists for a task
   * @param taskName The name of the task
   * @returns True if a handler exists, false otherwise
   */
  hasHandler(taskName: string): boolean {
    return this.registry.has(taskName);
  }

  /**
   * Get all registered task names
   * @returns An array of task names
   */
  getRegisteredTaskNames(): string[] {
    return Array.from(this.registry.keys());
  }
}
