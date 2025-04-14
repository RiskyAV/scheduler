import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@app/logger';

import { ConsoleLogHandler } from './concole-log.handler';

import { TaskType } from '../../../../../common/enums/tasks.enum';
import { TaskRegistryService } from '../task-registry.service';


describe('ConsoleLogHandler', () => {
  let handler: ConsoleLogHandler;
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
        ConsoleLogHandler,
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

    handler = module.get<ConsoleLogHandler>(ConsoleLogHandler);
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
        TaskType.CONSOLE_LOG,
        handler
      );

      // Verify that the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    it('should execute the task and log messages', async () => {
      // Call the method
      await handler.execute({ data: 'test data' }, 'task-id');

      // Verify that the logger was called with the correct parameters
      expect(logger.info).toHaveBeenCalledWith(
        'TASK_HANDLER',
        'Executing sample task: task-id',
        { taskId: 'task-id', payload: { data: 'test data' } }
      );

      expect(logger.info).toHaveBeenCalledWith(
        'TASK_HANDLER',
        'Sample task completed: task-id, Message being logged',
        { taskId: 'task-id', payload: { data: 'test data' } }
      );
    });
  });
});
