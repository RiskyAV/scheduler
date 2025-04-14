import { Injectable } from '@nestjs/common';
import sequelize from 'sequelize';

import { TaskRepository } from '../../../../database/repositories/task.repository';
import { TaskStatsResponseDto } from '../tasks/task.dto';

@Injectable()
export class MonitorService {
  constructor(
    private taskRepository: TaskRepository,
  ) {}

  async getStats(): Promise<TaskStatsResponseDto> {
    const stats = await this.taskRepository.get({},{
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const result: TaskStatsResponseDto = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    stats.forEach((stat: any) => {
      result[stat.status] = parseInt(stat.count, 10);
    });

    return result;
  }
}
