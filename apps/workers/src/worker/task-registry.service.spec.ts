import { Test, TestingModule } from '@nestjs/testing';

import { TaskHandler } from './task-handler.interface';
import { TaskRegistryService } from './task-registry.service';

describe('TaskRegistryService', () => {
  let service: TaskRegistryService;
  let mockTaskHandler: TaskHandler;

  beforeEach(async () => {
    // Create a mock task handler
    mockTaskHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskRegistryService],
    }).compile();

    service = module.get<TaskRegistryService>(TaskRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a task handler', () => {
      service.register('test-task', mockTaskHandler);

      expect(service.hasHandler('test-task')).toBe(true);
      expect(service.getHandler('test-task')).toBe(mockTaskHandler);
    });
  });

  describe('getHandler', () => {
    it('should return the handler when found', () => {
      service.register('test-task', mockTaskHandler);

      const handler = service.getHandler('test-task');

      expect(handler).toBe(mockTaskHandler);
    });

    it('should return undefined when handler not found', () => {
      const handler = service.getHandler('non-existent-task');

      expect(handler).toBeUndefined();
    });
  });

  describe('hasHandler', () => {
    it('should return true when handler exists', () => {
      service.register('test-task', mockTaskHandler);

      const hasHandler = service.hasHandler('test-task');

      expect(hasHandler).toBe(true);
    });

    it('should return false when handler does not exist', () => {
      const hasHandler = service.hasHandler('non-existent-task');

      expect(hasHandler).toBe(false);
    });
  });

  describe('getRegisteredTaskNames', () => {
    it('should return all registered task names', () => {
      service.register('task-1', mockTaskHandler);
      service.register('task-2', mockTaskHandler);
      service.register('task-3', mockTaskHandler);

      const taskNames = service.getRegisteredTaskNames();

      expect(taskNames).toHaveLength(3);
      expect(taskNames).toContain('task-1');
      expect(taskNames).toContain('task-2');
      expect(taskNames).toContain('task-3');
    });

    it('should return an empty array when no tasks are registered', () => {
      const taskNames = service.getRegisteredTaskNames();

      expect(taskNames).toHaveLength(0);
    });
  });
});
