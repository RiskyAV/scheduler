import process from 'process';

import { registerAs } from '@nestjs/config';
import * as nodeConfig from 'config';

import { AppConfig } from './config.interface';

import { ConfigKey, Environment } from '../common/enums/config.enum';

export default registerAs(
  ConfigKey.APP,
  (): AppConfig => ({
    env:
      Environment[process.env.NODE_ENV as keyof typeof Environment]
      || Environment.DEVELOPMENT,
    port: Number(nodeConfig.port),
    cronPort: Number(nodeConfig.cronPort),
    workerPort: Number(nodeConfig.workerPort),
    appName: nodeConfig.appName,
    nodeEnv: nodeConfig.nodeEnv,
  }),
);
