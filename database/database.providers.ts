import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';

import { LoggerService } from '@app/logger';

import { TaskEvent } from './entities/task-event.entity';
import { Task } from './entities/task.entity';

import { ConfigKey } from '../common/enums/config.enum';
import { DatabaseConfig } from '../configs/config.interface';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    inject: [ConfigService, LoggerService],
    useFactory: async (config: ConfigService, logger: LoggerService): Promise<Sequelize> => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: config.get<DatabaseConfig>(ConfigKey.DB)?.host,
        port: config.get<DatabaseConfig>(ConfigKey.DB)?.port,
        username: config.get<DatabaseConfig>(ConfigKey.DB)?.username,
        password: config.get<DatabaseConfig>(ConfigKey.DB)?.password,
        database: config.get<DatabaseConfig>(ConfigKey.DB)?.database,
        pool: {
          max: config.get<DatabaseConfig>(ConfigKey.DB)?.pool.max,
          acquire: config.get<DatabaseConfig>(ConfigKey.DB)?.pool.acquire,
          idle: config.get<DatabaseConfig>(ConfigKey.DB)?.pool.idle,
          evict: config.get<DatabaseConfig>(ConfigKey.DB)?.pool.evict,
        },
        logging: (sql): void => {
          logger.debug('QUERY', 'QUERY', { sql });
        },
        define: {
          underscored: true,
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      });

      sequelize.addModels([Task, TaskEvent]);

      await sequelize.authenticate();

      return sequelize;
    },
  },
];
