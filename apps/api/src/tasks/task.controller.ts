import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { LoggerService } from '@app/logger';

import { CreateTaskDto, GetTasksFilterDto, TaskResponseDto, UpdateTaskDto } from './task.dto';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(
      private readonly taskService: TaskService,
      private readonly logger: LoggerService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
      @Body() createTaskDto: CreateTaskDto,
  ): Promise<{ id: string }> {
    try {
      this.logger.info('Creating task', 'TaskController', { body: createTaskDto });
      return await this.taskService.create(createTaskDto);
    } catch (e) {
        this.logger.error('Error creating task', 'TaskController', { error: e });
        throw e;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() filterDto: GetTasksFilterDto
  ): Promise<TaskResponseDto[]> {
    try {
      this.logger.info('Fetching tasks with filters', 'TaskController', { filters: filterDto });
      return this.taskService.get(filterDto);
    } catch (e) {
        this.logger.error('Error fetching tasks', 'TaskController', { error: e });
        throw e;
    }
  }

  @Get(':id')
  async findOne(
      @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    try {
        this.logger.info('Fetching task', 'TaskController', { id });
      return this.taskService.findOne(id);
    } catch (e) {
        this.logger.error('Error fetching task', 'TaskController', { error: e });
        throw e;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
      @Param('id') id: string,
      ): Promise<void> {
    try {
      this.logger.info('Canceling task', 'TaskController', { id });
      return this.taskService.cancel(id);
    } catch (e) {
        this.logger.error('Error canceling task', 'TaskController', { error: e });
        throw e;
    }
  }

  @Patch(':id')
  async reschedule(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    try {
      this.logger.info('Rescheduling task', 'TaskController', { id, body: updateTaskDto });
      return this.taskService.reschedule(id, updateTaskDto);
    } catch (e) {
        this.logger.error('Error rescheduling task', 'TaskController', { error: e });
        throw e;
    }
  }
}
