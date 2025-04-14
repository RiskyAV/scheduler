import sequelize from 'sequelize';
import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    Default,
    AllowNull,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';

import { Task } from './task.entity';

import { TaskEventType } from '../../common/enums/tasks.enum';


@Table({
    tableName: 'task_events',
    updatedAt: false
})
export class TaskEvent extends Model {
    @PrimaryKey
    @Default(sequelize.UUIDV4)
    @Column({ type: DataType.UUID })
    id: string;

    @AllowNull(false)
    @ForeignKey(() => Task)
    @Column({
        type: DataType.UUID,
    })
    taskId: string;

    @BelongsTo(() => Task)
    task: Task;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM(...Object.values(TaskEventType)),
    })
    eventType: TaskEventType;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    message?: string;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
    metadata?: Record<string, unknown>;

    @CreatedAt
    @Column({
        type: DataType.DATE,
    })
    createdAt: Date;
}
