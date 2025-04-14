import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { LoggerService } from '@app/logger';

import { MonitorService } from './monitor.service';

import { TaskStatsResponseDto } from '../tasks/task.dto';

@Controller('monitor')
export class MonitorController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly logger: LoggerService
  ) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health(): { status: string } {
    try {
      this.logger.info('Checking health', 'MonitorController', {});
      return { status: 'ok' };
    } catch (e) {
      this.logger.error('Error checking health', 'MonitorController', { error: e });
      throw e;
    }
  }

  @Get('stats')
  async getStats(): Promise<TaskStatsResponseDto> {
    try {
      this.logger.info('Fetching stats', 'MonitorController', {});
      return this.monitorService.getStats();
    } catch (e) {
      this.logger.error('Error fetching stats', 'MonitorController', { error: e });
      throw e;
    }
  }
}
