import {
  Injectable,
  LoggerService as NestLoggerService,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../config/types';
import { MetricsService } from '../metrics/metrics.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    private readonly configService: ConfigService<Configuration>,
    private readonly metricsService: MetricsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
    this.metricsService.increment('logs.info');
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
    this.metricsService.increment('logs.error');
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
    this.metricsService.increment('logs.warn');
  }

  debug(message: string, context?: string) {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.debug(message, { context });
      this.metricsService.increment('logs.debug');
    }
  }

  verbose(message: string, context?: string) {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.verbose(message, { context });
      this.metricsService.increment('logs.verbose');
    }
  }

  logError(error: Error, context?: string) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
    };

    this.error(JSON.stringify(errorInfo), error.stack, context);
  }

  logRequest(request: any, context?: string) {
    const requestInfo = {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      timestamp: new Date().toISOString(),
    };

    this.debug(JSON.stringify(requestInfo), context);
  }

  logResponse(response: any, context?: string) {
    const responseInfo = {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
      timestamp: new Date().toISOString(),
    };

    this.debug(JSON.stringify(responseInfo), context);
  }
}
