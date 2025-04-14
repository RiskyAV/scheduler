import { registerAs } from '@nestjs/config';
import * as nodeConfig from 'config';

import { DatabaseConfig } from './config.interface';

import { ConfigKey } from '../common/enums/config.enum';

export default registerAs(
  ConfigKey.DB,
  (): DatabaseConfig => ({
    host: nodeConfig.db.host,
    port: Number(nodeConfig.db.port),
    username: nodeConfig.db.username,
    password: nodeConfig.db.password,
    database: nodeConfig.db.database,
    pool: {
      acquire: Number(nodeConfig.db.pool.acquire),
      evict: Number(nodeConfig.db.pool.evict),
      idle: Number(nodeConfig.db.pool.idle),
      max: Number(nodeConfig.db.pool.max),
    },
  }),
);
