import { Test, TestingModule } from '@nestjs/testing';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { LoggerService } from '@app/logger';

import { TaskHandler } from './task-handler.interface';
import { TaskRegistryService } from './task-registry.service';
import { WorkerThreadManager } from './worker-thread.manager';
import { WorkerService } from './worker.service';

import { ConfigKey } from '../../../../common/enums/config.enum';
import { TaskEventType, TaskStatus, TaskType } from '../../../../common/enums/tasks.enum';
import { Task } from '../../../../database/entities/task.entity';
import { TaskEventRepository } from '../../../../database/repositories/task-event.repository';
import { TaskRepository } from '../../../../database/repositories/task.repository';

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('WorkerService', () => {
  let service: WorkerService;
  let sequelize: jest.Mocked<Sequelize>;
  let taskRepository: jest.Mocked<TaskRepository>;
  let logger: jest.Mocked<LoggerService>;
  let taskRegistry: jest.Mocked<TaskRegistryService>;
  let taskEventRepository: jest.Mocked<TaskEventRepository>;
  let workerThreadManager: jest.Mocked<WorkerThreadManager>;
  let transaction: jest.Mocked<Transaction>;
  let mockTask: Partial<Task>;
  let mockHandler: jest.Mocked<TaskHandler>;

  beforeEach(async () => {
    // Create mocks
    transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Transaction>;

    sequelize = {
      transaction: jest.fn().mockResolvedValue(transaction),
      col: jest.fn().mockReturnValue('max_retries'),
    } as unknown as jest.Mocked<Sequelize>;

    mockTask = {
      id: 'task-id',
      taskName: 'test-task',
      type: TaskType.SAMPLE_TASK,
      status: TaskStatus.PENDING,
      payload: { data: 'test' },
      update: jest.fn().mockResolvedValue(undefined),
    };

    taskRepository = {
      getById: jest.fn(),
      get: jest.fn(),
      update: jest.fn().mockResolvedValue([1]),
    } as unknown as jest.Mocked<TaskRepository>;

    logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    mockHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TaskHandler>;

    taskRegistry = {
      hasHandler: jest.fn(),
      getHandler: jest.fn().mockReturnValue(mockHandler),
    } as unknown as jest.Mocked<TaskRegistryService>;

    taskEventRepository = {
      create: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<TaskEventRepository>;

    workerThreadManager = {
      setWorkerService: jest.fn(),
      runAllInWorkerThreads: jest.fn(),
      runInWorkerThread: jest.fn(),
    } as unknown as jest.Mocked<WorkerThreadManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerService,
        {
          provide: ConfigKey.SEQUELIZE,
          useValue: sequelize,
        },
        {
          provide: TaskRepository,
          useValue: taskRepository,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
        {
          provide: TaskRegistryService,
          useValue: taskRegistry,
        },
        {
          provide: TaskEventRepository,
          useValue: taskEventRepository,
        },
        {
          provide: WorkerThreadManager,
          useValue: workerThreadManager,
        },
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);

    // Mock setInterval and clearInterval
    jest.useFakeTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should set the worker service in the worker thread manager', () => {
      // Call the method
      service.onModuleInit();

      // Verify that the worker thread manager was called with the correct parameters
      expect(workerThreadManager.setWorkerService).toHaveBeenCalledWith(service);
    });
  });

  describe('startPolling', () => {
    it('should start polling for tasks', () => {
      // Mock the poll method
      jest.spyOn(service as any, 'poll').mockImplementation(() => {});

      // Call the method
      service.startPolling();

      // Verify that logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify that poll was called
      expect((service as any).poll).toHaveBeenCalled();

      // Verify that isPolling is true
      expect((service as any).isPolling).toBe(true);
    });

    it('should not start polling if already polling', () => {
      // Set isPolling to true
      (service as any).isPolling = true;

      // Mock the poll method
      jest.spyOn(service as any, 'poll').mockImplementation(() => {});

      // Call the method
      service.startPolling();

      // Verify that poll was not called
      expect((service as any).poll).not.toHaveBeenCalled();
    });
  });

  describe('stopPolling', () => {
    it('should stop polling for tasks', () => {
      // Set isPolling to true
      (service as any).isPolling = true;

      // Call the method
      service.stopPolling();

      // Verify that logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify that isPolling is false
      expect((service as any).isPolling).toBe(false);
    });
  });

  describe('createTaskEvent', () => {
    it('should create a task event', async () => {
      // Call the method
      await (service as any).createTaskEvent('task-id', TaskEventType.STARTED, 'Test message', { data: 'test' });

      // Verify that the task event repository was called with the correct parameters
      expect(taskEventRepository.create).toHaveBeenCalledWith({
        taskId: 'task-id',
        eventType: TaskEventType.STARTED,
        message: 'Test message',
        metadata: { data: 'test' },
      });
    });

    it('should handle errors when creating a task event', async () => {
      // Mock the task event repository to throw an error
      const error = new Error('Database error');
      taskEventRepository.create.mockRejectedValue(error);

      // Call the method
      await (service as any).createTaskEvent('task-id', TaskEventType.STARTED, 'Test message', { data: 'test' });

      // Verify that the logger was called with the error
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('processTask', () => {
    beforeEach(() => {
      // Reset the mock calls
      jest.clearAllMocks();
    });

    it('should process a task with a registered handler', async () => {
      // Mock the task registry to return a handler
      taskRegistry.hasHandler.mockReturnValue(true);

      // Call the method
      await (service as any).processTask(mockTask as Task);

      // Verify that the task registry was called
      expect(taskRegistry.hasHandler).toHaveBeenCalledWith(mockTask.type);
      expect(taskRegistry.getHandler).toHaveBeenCalledWith(mockTask.type);

      // Verify that the handler was called
      expect(mockHandler.execute).toHaveBeenCalledWith(mockTask.payload, mockTask.id);

      // Verify that the task was updated
      expect(mockTask.update).toHaveBeenCalledWith(expect.objectContaining({
        status: TaskStatus.COMPLETED
      }));

      // Verify that task events were created (LOCKED, STARTED, SUCCEEDED)
      expect(taskEventRepository.create).toHaveBeenCalledTimes(3);
    });

    it('should handle errors when processing a task', async () => {
      // Mock the task registry to return a handler
      taskRegistry.hasHandler.mockReturnValue(true);

      // Mock the handler to throw an error
      const error = new Error('Handler error');
      mockHandler.execute.mockRejectedValue(error);

      // Call the method
      await (service as any).processTask(mockTask as Task);

      // Verify that the task was updated with failed status
      expect(mockTask.update).toHaveBeenCalledWith(expect.objectContaining({
        status: TaskStatus.FAILED,
        lastError: error.message,
      }));

      // Verify that task events were created (LOCKED, STARTED, FAILED)
      expect(taskEventRepository.create).toHaveBeenCalledTimes(3);
    });

    it('should handle tasks with no registered handler', async () => {
      // Mock the task registry to return no handler
      taskRegistry.hasHandler.mockReturnValue(false);

      // Call the method
      await (service as any).processTask(mockTask as Task);

      // Verify that the task was updated with failed status
      expect(mockTask.update).toHaveBeenCalledWith(expect.objectContaining({
        status: TaskStatus.FAILED,
        lastError: `No handler registered for task type: ${mockTask.type}`,
      }));

      // Verify that task events were created (LOCKED, STARTED, FAILED)
      expect(taskEventRepository.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      taskRepository.getById.mockResolvedValue(mockTask as Task);

      const result = await service.getTaskById('task-id');

      expect(taskRepository.getById).toHaveBeenCalledWith('task-id');
      expect(result).toBe(mockTask);
    });

    it('should return null and log error when an exception occurs', async () => {
      const error = new Error('Database error');
      taskRepository.getById.mockRejectedValue(error);

      const result = await service.getTaskById('task-id');

      expect(taskRepository.getById).toHaveBeenCalledWith('task-id');
      expect(logger.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
