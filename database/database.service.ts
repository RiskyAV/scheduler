import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { LoggerService } from '@app/logger';

import { ConfigKey } from '../common/enums/config.enum';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @Inject(ConfigKey.SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly logger: LoggerService
  ) {}

  async onModuleDestroy(): Promise<void> {
    // Close the Sequelize connection when the module is destroyed
    await this.sequelize.close();
    this.logger.info('DATABASE', 'Sequelize connection closed gracefully', {});
  }
}
