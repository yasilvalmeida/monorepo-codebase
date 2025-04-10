import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from '../metrics/metrics.module';
import { Configuration } from '../config/types';

@Global()
@Module({
  imports: [
    ConfigModule,
    MetricsModule,
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => {
        const transports: winston.transport[] = [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              winston.format.colorize(),
              winston.format.printf(
                ({ timestamp, level, message, context, trace, ...meta }) => {
                  return `${timestamp} [${
                    context || 'Application'
                  }] ${level}: ${message} ${
                    Object.keys(meta).length ? JSON.stringify(meta) : ''
                  }${trace ? `\n${trace}` : ''}`;
                },
              ),
            ),
          }),
        ];

        /*
        Log to files
        transports.push(
          new winston.transports.Http({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ); */

        return { transports };
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
