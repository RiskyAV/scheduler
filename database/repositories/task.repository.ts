import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { BaseRepository } from './base.repository';

import {
  REPOSITORIES,
} from '../../common/constants/db.constants';
import { ConfigKey } from '../../common/enums/config.enum';
import { Task } from '../entities/task.entity';

@Injectable()
export class TaskRepository extends BaseRepository<Task> {
  constructor(
    @Inject(ConfigKey.SEQUELIZE) sequelize: Sequelize,
    @Inject(REPOSITORIES.TASK)
    taskRepository: typeof Task,
  ) {
    super(sequelize, Task, taskRepository);
  }
}
