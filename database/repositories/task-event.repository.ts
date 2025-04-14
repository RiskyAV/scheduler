import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { BaseRepository } from './base.repository';

import {
  REPOSITORIES,
} from '../../common/constants/db.constants';
import { ConfigKey } from '../../common/enums/config.enum';
import { TaskEvent } from '../entities/task-event.entity';

@Injectable()
export class TaskEventRepository extends BaseRepository<TaskEvent> {
  constructor(
    @Inject(ConfigKey.SEQUELIZE) sequelize: Sequelize,
    @Inject(REPOSITORIES.TASK_EVENT)
    taskEventRepository: typeof TaskEvent,
  ) {
    super(sequelize, TaskEvent, taskEventRepository);
  }
}
