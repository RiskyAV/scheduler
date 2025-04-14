import { Test, TestingModule } from '@nestjs/testing';

import { MonitorService } from './monitor.service';

import { TaskStatus } from '../../../../common/enums/tasks.enum';
import { TaskRepository } from '../../../../database/repositories/task.repository';


describe('MonitorService', () => {
  let service: MonitorService;
  let taskRepository: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    // Create mock repository
    taskRepository = {
      get: jest.fn(),
    } as unknown as jest.Mocked<TaskRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorService,
        {
          provide: TaskRepository,
          useValue: taskRepository,
        },
      ],
    }).compile();

    service = module.get<MonitorService>(MonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return task statistics with counts for each status', async () => {
      // Mock repository response
      taskRepository.get.mockResolvedValue([
        // @ts-expect-error: unit testing
        { status: TaskStatus.PENDING, count: '5' },
        // @ts-expect-error: unit testing
        { status: TaskStatus.PROCESSING, count: '2' },
        // @ts-expect-error: unit testing
        { status: TaskStatus.COMPLETED, count: '10' },
        // @ts-expect-error: unit testing
        { status: TaskStatus.FAILED, count: '1' },
      ]);

      // Call the service method
      const result = await service.getStats();

      // Verify the repository was called with the correct parameters
      expect(taskRepository.get).toHaveBeenCalledWith({}, expect.objectContaining({
        attributes: expect.arrayContaining([
          'status',
          expect.any(Array),
        ]),
        group: ['status'],
        raw: true,
      }));

      // Verify the result
      expect(result).toEqual({
        pending: 5,
        processing: 2,
        completed: 10,
        failed: 1,
        cancelled: 0,
      });
    });

    it('should return zero counts for statuses not in the result', async () => {
      // Mock repository response with only some statuses
      taskRepository.get.mockResolvedValue([
        // @ts-expect-error: unit testing
        { status: TaskStatus.PENDING, count: '5' },
      ]);

      // Call the service method
      const result = await service.getStats();

      // Verify the repository was called
      expect(taskRepository.get).toHaveBeenCalled();

      // Verify the result has all statuses with correct counts
      expect(result).toEqual({
        pending: 5,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      });
    });

    it('should handle empty result from repository', async () => {
      // Mock repository response with empty array
      taskRepository.get.mockResolvedValue([]);

      // Call the service method
      const result = await service.getStats();

      // Verify the repository was called
      expect(taskRepository.get).toHaveBeenCalled();

      // Verify the result has all statuses with zero counts
      expect(result).toEqual({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      });
    });
  });
});
