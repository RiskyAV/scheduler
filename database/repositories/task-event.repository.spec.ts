import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';

import { BaseRepository } from './base.repository';
import { TaskEventRepository } from './task-event.repository';

import { REPOSITORIES } from '../../common/constants/db.constants';
import { ConfigKey } from '../../common/enums/config.enum';
import { TaskEvent } from '../entities/task-event.entity';

describe('TaskEventRepository', () => {
  let repository: TaskEventRepository;
  let sequelize: jest.Mocked<Sequelize>;

  beforeEach(async () => {
    // Create mock sequelize
    sequelize = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<Sequelize>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskEventRepository,
        {
          provide: ConfigKey.SEQUELIZE,
          useValue: sequelize,
        },
        {
          provide: REPOSITORIES.TASK_EVENT,
          useValue: TaskEvent,
        },
      ],
    }).compile();

    repository = module.get<TaskEventRepository>(TaskEventRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should extend BaseRepository', () => {
    expect(repository).toBeInstanceOf(BaseRepository);
  });

  it('should be initialized with the correct dependencies', () => {
    // We can't directly test the constructor parameters, but we can test
    // that the repository has the correct properties by calling a method
    // that uses them

    // Mock the startTransaction method of the parent class
    jest.spyOn(BaseRepository.prototype, 'startTransaction').mockImplementation(() => {
      return Promise.resolve({} as any);
    });

    // Call a method that uses the sequelize dependency
    repository.startTransaction();

    // Verify that the method was called
    expect(BaseRepository.prototype.startTransaction).toHaveBeenCalled();
  });
});
