import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { LoggerService } from '@app/logger';

import { AppModule } from './app.module';

import { ConfigKey } from '../../../common/enums/config.enum';
import { AppConfig } from '../../../configs/config.interface';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();
  app.enableCors();

  const config = app.get(ConfigService);
  const appConfig = config.get<AppConfig>(ConfigKey.APP);
  const logger = app.get(LoggerService);

  if (!appConfig) {
    throw new Error('App configuration not found');
  }
  await app.listen(appConfig.port);
  logger.info('API', `API is running on port ${appConfig.port}`, {});
}

bootstrap();
