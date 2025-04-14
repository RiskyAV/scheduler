import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@app/logger';

import { SampleTaskHandler } from './sample-task.handler';

import { TaskType } from '../../../../../common/enums/tasks.enum';
import { TaskRegistryService } from '../task-registry.service';


describe('SampleTaskHandler', () => {
  let handler: SampleTaskHandler;
  let logger: jest.Mocked<LoggerService>;
  let taskRegistry: jest.Mocked<TaskRegistryService>;

  beforeEach(async () => {
    // Create mocks
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    taskRegistry = {
      register: jest.fn(),
    } as unknown as jest.Mocked<TaskRegistryService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SampleTaskHandler,
        {
          provide: LoggerService,
          useValue: logger,
        },
        {
          provide: TaskRegistryService,
          useValue: taskRegistry,
        },
      ],
    }).compile();

    handler = module.get<SampleTaskHandler>(SampleTaskHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register the handler with the task registry', () => {
      // Call the method
      handler.onModuleInit();

      // Verify that the task registry was called with the correct parameters
      expect(taskRegistry.register).toHaveBeenCalledWith(
        TaskType.SAMPLE_TASK,
        handler
      );

      // Verify that the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    it('should execute the task and log messages', async () => {
      // Mock the setTimeout function
      jest.useFakeTimers();

      // Call the method
      const executePromise = handler.execute({ message: 'test message' }, 'task-id');

      // Fast-forward the timer
      jest.advanceTimersByTime(1000);

      // Wait for the promise to resolve
      await executePromise;

      // Verify that the logger was called with the correct parameters
      expect(logger.info).toHaveBeenCalledWith(
        'TASK_HANDLER',
        'Executing sample task: task-id',
        { taskId: 'task-id', payload: { message: 'test message' } }
      );

      expect(logger.info).toHaveBeenCalledWith(
        'TASK_HANDLER',
        'Sample task completed: task-id, Message: test message',
        { taskId: 'task-id', message: 'test message' }
      );

      // Restore the real timers
      jest.useRealTimers();
    });

    it('should use a default message if none is provided', async () => {
      // Mock the setTimeout function
      jest.useFakeTimers();

      // Call the method with an empty payload
      const executePromise = handler.execute({}, 'task-id');

      // Fast-forward the timer
      jest.advanceTimersByTime(1000);

      // Wait for the promise to resolve
      await executePromise;

      // Verify that the logger was called with the default message
      expect(logger.info).toHaveBeenCalledWith(
        'TASK_HANDLER',
        'Sample task completed: task-id, Message: No message provided',
        { taskId: 'task-id', message: 'No message provided' }
      );

      // Restore the real timers
      jest.useRealTimers();
    });
  });
});
