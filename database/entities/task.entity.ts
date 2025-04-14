import sequelize from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  Default,
  AllowNull, PrimaryKey,
} from 'sequelize-typescript';

import { TaskStatus, TaskType } from '../../common/enums/tasks.enum';

@Table
export class Task extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
  })
  taskName: string;

  @AllowNull(false)
  @Default(TaskType.SAMPLE_TASK)
  @Column({
    type: DataType.ENUM(...Object.values(TaskType)),
  })
  type: TaskType;

  @Column({
    type: DataType.JSONB,
  })
  payload: Record<string, unknown>;

  @AllowNull(false)
  @Default(TaskStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
  })
  status: TaskStatus;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  priority: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  scheduledAt: Date;

  @AllowNull(false)
  @Default(3)
  @Column({
    type: DataType.INTEGER,
  })
  maxRetries: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  retryCount: number;

  @Column({
    type: DataType.TEXT,
  })
  lastError: string;

  @Column({
    type: DataType.DATE,
  })
  nextRetryAt: Date;

  @Column({
    type: DataType.STRING(255),
  })
  lockedBy: string;

  @Column({
    type: DataType.DATE,
  })
  lockedAt: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
  })
  declare updatedAt: Date;
}
