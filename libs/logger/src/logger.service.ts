import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import pino from 'pino';

export interface ILoggerService {
  debug(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void;
  info(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void;
  warn(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void;
  error(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void;
  fatal(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void;
}

@Injectable()
export class LoggerService implements ILoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: 'debug',           // Minimum level to log (trace, debug, info, warn, error, fatal)
      transport: {
        target: 'pino-pretty', // Optional: human-readable output for dev
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  debug(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void {
    this.logger.debug({ event, title, meta, req });
  }

  info(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void {
    this.logger.info({ event, title, meta, req });
  }

  warn(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void {
    this.logger.warn({ event, title, meta, req });
  }

  error(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void {
    this.logger.error({ event, title, meta, req });
  }

  fatal(
    event: string,
    title: string,
    meta: Record<string, unknown>,
    req?: Request,
  ): void {
    this.logger.fatal({ event, title, meta, req });
  }
}
