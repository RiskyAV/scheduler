import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';

import { CreateTaskDto, UpdateTaskDto, GetTasksFilterDto } from './task.dto';
import { TaskService } from './task.service';

import { TaskStatus, TaskType } from '../../../../common/enums/tasks.enum';
import { Task } from '../../../../database/entities/task.entity';
import { TaskRepository } from '../../../../database/repositories/task.repository';


describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    // Create mock repository
    taskRepository = {
      create: jest.fn(),
      get: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: taskRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task with default values', async () => {
      // Mock data
      const createTaskDto = {
        taskName: 'Test Task',
      } as CreateTaskDto;
      const mockTask = { id: '1', taskName: 'Test Task' } as Task;

      // Mock repository response
      taskRepository.create.mockResolvedValue(mockTask);

      // Call the service method
      const result = await service.create(createTaskDto);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.create).toHaveBeenCalledWith({
        taskName: 'Test Task',
        type: TaskType.SAMPLE_TASK,
        payload: {},
        priority: 0,
        maxRetries: 3,
        scheduledAt: expect.any(Date),
        status: TaskStatus.PENDING,
      });

      // Verify the result
      expect(result).toBe(mockTask);
    });

    it('should create a task with provided values', async () => {
      // Mock data
      const scheduledAt = new Date('2023-01-01T00:00:00Z');
      const createTaskDto: CreateTaskDto = {
        taskName: 'Test Task',
        type: TaskType.SAMPLE_TASK,
        payload: { data: 'test' },
        priority: 1,
        maxRetries: 5,
        scheduledAt: scheduledAt.toISOString(),
      };
      const mockTask = { id: '1', ...createTaskDto } as unknown as Task;

      // Mock repository response
      taskRepository.create.mockResolvedValue(mockTask);

      // Call the service method
      const result = await service.create(createTaskDto);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.create).toHaveBeenCalledWith({
        taskName: 'Test Task',
        type: TaskType.SAMPLE_TASK,
        payload: { data: 'test' },
        priority: 1,
        maxRetries: 5,
        scheduledAt,
        status: TaskStatus.PENDING,
      });

      // Verify the result
      expect(result).toBe(mockTask);
    });
  });

  describe('get', () => {
    it('should get tasks with filters', async () => {
      // Mock data
      const filterDto: GetTasksFilterDto = {
        taskName: 'Test',
        type: TaskType.SAMPLE_TASK,
        status: TaskStatus.PENDING,
        priority: 1,
        scheduledAfter: '2023-01-01T00:00:00Z',
        scheduledBefore: '2023-01-02T00:00:00Z',
        createdAfter: '2023-01-01T00:00:00Z',
        createdBefore: '2023-01-02T00:00:00Z',
        limit: 10,
        offset: 0,
      };
      const mockTasks = [
        { id: '1', taskName: 'Test Task 1' },
        { id: '2', taskName: 'Test Task 2' },
      ] as Task[];

      // Mock repository response
      taskRepository.get.mockResolvedValue(mockTasks);

      // Call the service method
      const result = await service.get(filterDto);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.get).toHaveBeenCalledWith(
        {
          taskName: { [Op.iLike]: '%Test%' },
          type: TaskType.SAMPLE_TASK,
          status: TaskStatus.PENDING,
          priority: 1,
          scheduledAt: {
            [Op.gte]: new Date('2023-01-01T00:00:00Z'),
            [Op.lte]: new Date('2023-01-02T00:00:00Z'),
          },
          createdAt: {
            [Op.gte]: new Date('2023-01-01T00:00:00Z'),
            [Op.lte]: new Date('2023-01-02T00:00:00Z'),
          },
        },
        {
          order: [
            ['scheduled_at', 'ASC'],
            ['priority', 'ASC'],
          ],
          pagination: {
            limit: 10,
            offset: 0,
          },
        }
      );

      // Verify the result
      expect(result).toBe(mockTasks);
    });

    it('should get tasks with only type filter', async () => {
      // Mock data
      const filterDto: GetTasksFilterDto = {
        type: TaskType.SAMPLE_TASK,
      };
      const mockTasks = [
        { id: '1', taskName: 'Test Task 1', type: TaskType.SAMPLE_TASK },
        { id: '2', taskName: 'Test Task 2', type: TaskType.SAMPLE_TASK },
      ] as Task[];

      // Mock repository response
      taskRepository.get.mockResolvedValue(mockTasks);

      // Call the service method
      const result = await service.get(filterDto);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.get).toHaveBeenCalledWith(
        {
          type: TaskType.SAMPLE_TASK,
        },
        {
          order: [
            ['scheduled_at', 'ASC'],
            ['priority', 'ASC'],
          ],
        }
      );

      // Verify the result
      expect(result).toBe(mockTasks);
    });

    it('should get tasks without filters', async () => {
      // Mock data
      const mockTasks = [
        { id: '1', taskName: 'Test Task 1' },
        { id: '2', taskName: 'Test Task 2' },
      ] as Task[];

      // Mock repository response
      taskRepository.get.mockResolvedValue(mockTasks);

      // Call the service method
      const result = await service.get();

      // Verify the repository was called with the correct parameters
      expect(taskRepository.get).toHaveBeenCalledWith(
        {},
        {
          order: [
            ['scheduled_at', 'ASC'],
            ['priority', 'ASC'],
          ],
        }
      );

      // Verify the result
      expect(result).toBe(mockTasks);
    });
  });

  describe('findOne', () => {
    it('should find a task by ID', async () => {
      // Mock data
      const taskId = '1';
      const mockTask = { id: taskId, taskName: 'Test Task' } as Task;

      // Mock repository response
      taskRepository.getById.mockResolvedValue(mockTask);

      // Call the service method
      const result = await service.findOne(taskId);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.getById).toHaveBeenCalledWith(taskId);

      // Verify the result
      expect(result).toBe(mockTask);
    });

    it('should throw NotFoundException when task is not found', async () => {
      // Mock data
      const taskId = '1';

      // Mock repository response
      taskRepository.getById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(taskId)).rejects.toThrow(`Task with ID "${taskId}" not found`);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending task', async () => {
      // Mock data
      const taskId = '1';
      const mockTask = {
        id: taskId,
        taskName: 'Test Task',
        status: TaskStatus.PENDING,
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as Task;

      // Mock repository response
      taskRepository.getById.mockResolvedValue(mockTask);

      // Call the service method
      await service.cancel(taskId);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.getById).toHaveBeenCalledWith(taskId);

      // Verify the task was updated
      expect(mockTask.update).toHaveBeenCalledWith({ status: TaskStatus.CANCELLED });
    });

    it('should throw NotFoundException when task is not found', async () => {
      // Mock data
      const taskId = '1';

      // Mock repository response
      taskRepository.getById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(service.cancel(taskId)).rejects.toThrow(NotFoundException);
      await expect(service.cancel(taskId)).rejects.toThrow(`Task with ID "${taskId}" not found`);
    });

    it('should throw ConflictException when task is not pending', async () => {
      // Mock data
      const taskId = '1';
      const mockTask = {
        id: taskId,
        taskName: 'Test Task',
        status: TaskStatus.PROCESSING,
      } as Task;

      // Mock repository response
      taskRepository.getById.mockResolvedValue(mockTask);

      // Call the service method and expect it to throw
      await expect(service.cancel(taskId)).rejects.toThrow(ConflictException);
      await expect(service.cancel(taskId)).rejects.toThrow(
        `Cannot cancel task with status "${TaskStatus.PROCESSING}"`
      );
    });
  });

  describe('reschedule', () => {
    it('should reschedule a pending task', async () => {
      // Mock data
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        scheduledAt: '2023-01-01T00:00:00Z',
      };
      const mockTask = {
        id: taskId,
        taskName: 'Test Task',
        status: TaskStatus.PENDING,
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as Task;

      // Mock repository response
      taskRepository.getById.mockResolvedValue(mockTask);

      // Call the service method
      const result = await service.reschedule(taskId, updateTaskDto);

      // Verify the repository was called with the correct parameters
      expect(taskRepository.getById).toHaveBeenCalledWith(taskId);

      // Verify the task was updated
      expect(mockTask.update).toHaveBeenCalledWith({
        scheduled_at: new Date('2023-01-01T00:00:00Z'),
      });

      // Verify the result
      expect(result).toBe(mockTask);
    });

    it('should throw NotFoundException when task is not found', async () => {
      // Mock data
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        scheduledAt: '2023-01-01T00:00:00Z',
      };

      // Mock repository response
      taskRepository.getById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(service.reschedule(taskId, updateTaskDto)).rejects.toThrow(NotFoundException);
      await expect(service.reschedule(taskId, updateTaskDto)).rejects.toThrow(
        `Task with ID "${taskId}" not found`
      );
    });

    it('should throw ConflictException when task is not pending', async () => {
      // Mock data
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        scheduledAt: '2023-01-01T00:00:00Z',
      };
      const mockTask = {
        id: taskId,
        taskName: 'Test Task',
        status: TaskStatus.PROCESSING,
      } as Task;

      // Mock repository response
      taskRepository.getById.mockResolvedValue(mockTask);

      // Call the service method and expect it to throw
      await expect(service.reschedule(taskId, updateTaskDto)).rejects.toThrow(ConflictException);
      await expect(service.reschedule(taskId, updateTaskDto)).rejects.toThrow(
        `Cannot reschedule task with status "${TaskStatus.PROCESSING}"`
      );
    });
  });
});
