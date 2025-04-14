import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { LoggerService } from '@app/logger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  
  const port = configService.get('APP.workerPort') || 3002;
  
  await app.listen(port);
  
  loggerService.info('WORKER', `Worker service is running on port ${port}`, {});
}

bootstrap();
