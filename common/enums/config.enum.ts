/*
  This file contains all the ENUMs for environment variables
*/
export enum ConfigKey {
  APP = 'APP',
  DB = 'DB',
  LOGGER = 'LOGGER',
  SEQUELIZE = 'SEQUELIZE',
}

export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}
