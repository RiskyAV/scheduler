import { Environment } from '../common/enums/config.enum';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  pool: {
    acquire: number;
    evict: number;
    idle: number;
    max: number;
  };
}

export interface ConfigMethods {
  isDevelopment: () => boolean;
  isProduction: () => boolean;
}

export interface AppConfig {
  env: Environment;
  appName: string;
  port: number;
  cronPort: number;
  workerPort: number;
  nodeEnv: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  isTls: boolean;
  ttl?: number;
}

export interface Config {
  appConfig: AppConfig;
  databaseConfig?: DatabaseConfig;
  redisConfig?: RedisConfig;
}
