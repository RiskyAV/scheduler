/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = __dirname;
import appConfig from './app.config';
import databaseConfig from './database.config';


import { Environment } from '../common/enums/config.enum';

export const configurations = [
  appConfig,
  databaseConfig,
];

export const configMethods = {
  isDevelopmentEnv: (): boolean => process.env.NODE_ENV === Environment.DEVELOPMENT,
  isProductionEnv: (): boolean => process.env.NODE_ENV === Environment.PRODUCTION,
  isTestEnv: (): boolean => process.env.NODE_ENV === Environment.DEVELOPMENT,
  isStagingEnv: (): boolean => process.env.NODE_ENV === Environment.PRODUCTION,
  isLocalEnv: (): boolean => process.env.NODE_ENV === Environment.LOCAL,
};
