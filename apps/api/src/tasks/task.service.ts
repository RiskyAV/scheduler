import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import  { Op } from 'sequelize';

import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, GetTasksFilterDto } from './task.dto';

import { TaskStatus, TaskType } from '../../../../common/enums/tasks.enum';
import { TaskRepository } from '../../../../database/repositories/task.repository';

@Injectable()
export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const now = new Date();
    const scheduledAt = createTaskDto.scheduledAt
      ? new Date(createTaskDto.scheduledAt)
      : now;

    const createTaskObj = {
      taskName: createTaskDto.taskName,
      type: createTaskDto.type || TaskType.SAMPLE_TASK,
      payload: createTaskDto.payload || {},
      priority: createTaskDto.priority || 0,
      maxRetries: createTaskDto.maxRetries || 3,
      scheduledAt,
      status: TaskStatus.PENDING,
    };

    return await this.taskRepository.create(createTaskObj);
  }

  async get(filterDto?: GetTasksFilterDto): Promise<TaskResponseDto[]> {
    const {
      taskName,
      type,
      status,
      priority,
      scheduledAfter,
      scheduledBefore,
      createdAfter,
      createdBefore,
      limit,
      offset
    } = filterDto || {};

    const where: any = {};

    if (taskName) {
      where.taskName = { [Op.iLike]: `%${taskName}%` };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (priority !== undefined) {
      where.priority = priority;
    }

    if (scheduledAfter || scheduledBefore) {
      where.scheduledAt = {};

      if (scheduledAfter) {
        where.scheduledAt[Op.gte] = new Date(scheduledAfter);
      }

      if (scheduledBefore) {
        where.scheduledAt[Op.lte] = new Date(scheduledBefore);
      }
    }

    if (createdAfter || createdBefore) {
      where.createdAt = {};

      if (createdAfter) {
        where.createdAt[Op.gte] = new Date(createdAfter);
      }

      if (createdBefore) {
        where.createdAt[Op.lte] = new Date(createdBefore);
      }
    }

    const options: any = {
      order: [
        ['scheduled_at', 'ASC'],
        ['priority', 'ASC'],
      ],
    };

    if (limit !== undefined) {
      options.pagination = {
        limit,
        offset: offset || 0
      };
    }

    return await this.taskRepository.get(where, options);
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.getById(id);

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async cancel(id: string): Promise<void> {
    const task = await this.taskRepository.getById(id);

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new ConflictException(`Cannot cancel task with status "${task.status}"`);
    }

    await task.update({ status: TaskStatus.CANCELLED });
  }

  async reschedule(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.taskRepository.getById(id);

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new ConflictException(`Cannot reschedule task with status "${task.status}"`);
    }

    const scheduled_at = new Date(updateTaskDto.scheduledAt);
    await task.update({ scheduled_at });

    return task
  }

}
