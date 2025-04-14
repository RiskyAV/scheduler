import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDateString, IsInt, Min, IsObject, Max, IsEnum } from 'class-validator';

import { TaskStatus, TaskType } from '../../../../common/enums/tasks.enum';

export class GetTasksFilterDto {
  @IsOptional()
  @IsString()
  taskName?: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsDateString()
  scheduledAfter?: string;

  @IsOptional()
  @IsDateString()
  scheduledBefore?: string;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}

export class CreateTaskDto {
  @IsString()
  taskName: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsObject()
  payload?: Record<string, unknown>;

  @IsDateString({}, { message: 'Invalid date format' })
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxRetries?: number;
}

export class UpdateTaskDto {
  @IsDateString()
  scheduledAt: string;
}

export class TaskResponseDto {
  id: string;
  taskName: string;
  type: TaskType;
  payload: Record<string, unknown>;
  status: string;
  priority: number;
  scheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
  maxRetries: number;
  retryCount: number;
  lastError?: string;
  nextRetryAt?: Date;
  lockedBy?: string;
  lockedAt?: Date;
}

export class TaskStatsResponseDto {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
}
