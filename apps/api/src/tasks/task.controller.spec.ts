import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@app/logger';

import { TaskController } from './task.controller';
import { CreateTaskDto, GetTasksFilterDto, TaskResponseDto, UpdateTaskDto } from './task.dto';
import { TaskService } from './task.service';

import { TaskStatus, TaskType } from '../../../../common/enums/tasks.enum';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: jest.Mocked<TaskService>;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    // Create mocks
    taskService = {
      create: jest.fn(),
      get: jest.fn(),
      findOne: jest.fn(),
      cancel: jest.fn(),
      reschedule: jest.fn(),
    } as unknown as jest.Mocked<TaskService>;

    logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: taskService,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      // Mock data
      const createTaskDto: CreateTaskDto = {
        taskName: 'Test Task',
        type: TaskType.SAMPLE_TASK,
        payload: { data: 'test' },
        scheduledAt: '2023-01-01T00:00:00Z',
        priority: 1,
        maxRetries: 3,
      };
      const mockResult = {
        id: 'd3cf828c-03f3-482c-8cdf-446686253e22',
        status: TaskStatus.PENDING,
        retryCount: 0
      } as TaskResponseDto;

      // Mock service response
      taskService.create.mockResolvedValue(mockResult);

      // Call the controller method
      const result = await controller.create(createTaskDto);

      // Verify the service was called with the correct parameters
      expect(taskService.create).toHaveBeenCalledWith(createTaskDto);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify the result
      expect(result).toBe(mockResult);
    });

    it('should handle errors', async () => {
      const createTaskDto: CreateTaskDto = {
        taskName: 'Test Task',
        type: TaskType.SAMPLE_TASK,
        payload: { data: 'test' },
        scheduledAt: '2023-01-01T00:00:00Z',
        priority: 1,
        maxRetries: 3,
      };
      const error = new Error('Test error');

      // Mock service response
      taskService.create.mockRejectedValue(error);

      // Call the controller method and expect it to throw
      await expect(controller.create(createTaskDto)).rejects.toThrow(error);

      // Verify the service was called with the correct parameters
      expect(taskService.create).toHaveBeenCalledWith(createTaskDto);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get tasks with filters', async () => {
      // Mock data
      const filterDto: GetTasksFilterDto = {
        taskName: 'Test',
        type: TaskType.SAMPLE_TASK,
        status: TaskStatus.PENDING,
      };
      const mockTasks: TaskResponseDto[] = [
        { id: '1', taskName: 'Test Task 1' } as TaskResponseDto,
        { id: '2', taskName: 'Test Task 2' } as TaskResponseDto,
      ];

      // Mock service response
      taskService.get.mockResolvedValue(mockTasks);

      // Call the controller method
      const result = await controller.get(filterDto);

      // Verify the service was called with the correct parameters
      expect(taskService.get).toHaveBeenCalledWith(filterDto);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify the result
      expect(result).toBe(mockTasks);
    });

    it('should handle errors', async () => {
      // Mock data
      const filterDto: GetTasksFilterDto = {
        taskName: 'Test',
      };
      const error = new Error('Test error');

      // Mock service response
      taskService.get.mockRejectedValue(error);

      // Call the controller method and catch the error
      try {
        await controller.get(filterDto);
        fail('Expected controller.get to throw an error');
      } catch (e) {
        // Verify the error is what we expect
        expect(e).toBe(error);
      }

      // Verify the service was called with the correct parameters
      expect(taskService.get).toHaveBeenCalledWith(filterDto);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a task by ID', async () => {
      // Mock data
      const taskId = '1';
      const mockTask: TaskResponseDto = {
        id: taskId,
        taskName: 'Test Task',
      } as TaskResponseDto;

      // Mock service response
      taskService.findOne.mockResolvedValue(mockTask);

      // Call the controller method
      const result = await controller.findOne(taskId);

      // Verify the service was called with the correct parameters
      expect(taskService.findOne).toHaveBeenCalledWith(taskId);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify the result
      expect(result).toBe(mockTask);
    });

    it('should handle errors', async () => {
      // Mock data
      const taskId = '1';
      const error = new Error('Test error');

      // Mock service response
      taskService.findOne.mockRejectedValue(error);

      // Call the controller method and catch the error
      try {
        await controller.findOne(taskId);
        fail('Expected controller.findOne to throw an error');
      } catch (e) {
        // Verify the error is what we expect
        expect(e).toBe(error);
      }

      // Verify the service was called with the correct parameters
      expect(taskService.findOne).toHaveBeenCalledWith(taskId);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel a task', async () => {
      // Mock data
      const taskId = '1';

      // Mock service response
      taskService.cancel.mockResolvedValue(undefined);

      // Call the controller method
      await controller.cancel(taskId);

      // Verify the service was called with the correct parameters
      expect(taskService.cancel).toHaveBeenCalledWith(taskId);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Mock data
      const taskId = '1';
      const error = new Error('Test error');

      // Mock service response
      taskService.cancel.mockRejectedValue(error);

      // Call the controller method and catch the error
      try {
        await controller.cancel(taskId);
        fail('Expected controller.cancel to throw an error');
      } catch (e) {
        // Verify the error is what we expect
        expect(e).toBe(error);
      }

      // Verify the service was called with the correct parameters
      expect(taskService.cancel).toHaveBeenCalledWith(taskId);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('reschedule', () => {
    it('should reschedule a task', async () => {
      // Mock data
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        scheduledAt: '2023-01-01T00:00:00Z',
      };
      const mockTask: TaskResponseDto = {
        id: taskId,
        taskName: 'Test Task',
      } as TaskResponseDto;

      // Mock service response
      taskService.reschedule.mockResolvedValue(mockTask);

      // Call the controller method
      const result = await controller.reschedule(taskId, updateTaskDto);

      // Verify the service was called with the correct parameters
      expect(taskService.reschedule).toHaveBeenCalledWith(taskId, updateTaskDto);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify the result
      expect(result).toBe(mockTask);
    });

    it('should handle errors', async () => {
      // Mock data
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        scheduledAt: '2023-01-01T00:00:00Z',
      };
      const error = new Error('Test error');

      // Mock service response
      taskService.reschedule.mockRejectedValue(error);

      // Call the controller method and catch the error
      try {
        await controller.reschedule(taskId, updateTaskDto);
        fail('Expected controller.reschedule to throw an error');
      } catch (e) {
        // Verify the error is what we expect
        expect(e).toBe(error);
      }

      // Verify the service was called with the correct parameters
      expect(taskService.reschedule).toHaveBeenCalledWith(taskId, updateTaskDto);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
