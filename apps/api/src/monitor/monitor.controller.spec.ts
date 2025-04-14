import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@app/logger';

import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';

import { TaskStatsResponseDto } from '../tasks/task.dto';

describe('MonitorController', () => {
  let controller: MonitorController;
  let monitorService: jest.Mocked<MonitorService>;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    // Create mocks
    monitorService = {
      getStats: jest.fn(),
    } as unknown as jest.Mocked<MonitorService>;

    logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitorController],
      providers: [
        {
          provide: MonitorService,
          useValue: monitorService,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
      ],
    }).compile();

    controller = module.get<MonitorController>(MonitorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return status ok', () => {
      // Call the controller method
      const result = controller.health();

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual({ status: 'ok' });
    });

    it('should handle errors', () => {
      // Mock error
      const error = new Error('Test error');

      // Mock logger to throw an error
      logger.info.mockImplementation(() => {
        throw error;
      });

      // Call the controller method and expect it to throw
      expect(() => controller.health()).toThrow(error);

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return task statistics', async () => {
      // Mock data
      const mockStats: TaskStatsResponseDto = {
        pending: 5,
        processing: 2,
        completed: 10,
        failed: 1,
        cancelled: 0,
      };

      // Mock service response
      monitorService.getStats.mockResolvedValue(mockStats);

      // Call the controller method
      const result = await controller.getStats();

      // Verify the service was called
      expect(monitorService.getStats).toHaveBeenCalled();

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();

      // Verify the result
      expect(result).toBe(mockStats);
    });

    it('should handle errors', async () => {
      // Mock error
      const error = new Error('Test error');

      // Mock service response
      monitorService.getStats.mockRejectedValue(error);

      // Call the controller method and expect it to throw
      await expect(controller.getStats()).rejects.toThrow(error);

      // Verify the service was called
      expect(monitorService.getStats).toHaveBeenCalled();

      // Verify the logger was called
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
