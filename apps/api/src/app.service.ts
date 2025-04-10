import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseError,
  RedisError,
  RateLimitError,
} from './shared/errors/types';
import { Configuration } from './shared/config/types';
import { MetricsService } from './shared/metrics/metrics.service';
import { LoggerService } from './shared/logger/logger.service';
import { PrismaService } from './shared/prisma/prisma.service';
import { RedisService } from './shared/redis/redis.service';
import { retry } from './shared/utils/retry';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly nestLogger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService<Configuration>,
    private readonly metricsService: MetricsService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    try {
      await this.checkAllServices();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.logError(error, 'HealthService');
      } else {
        this.nestLogger.error(
          'Unknown error during health check initialization',
        );
      }
    }
  }

  private async checkDatabase() {
    try {
      await retry(
        async () => {
          await this.prisma.$queryRaw`SELECT 1`;
        },
        3,
        1000,
        this.nestLogger,
      );
      this.metricsService.increment('health.database.success');
      this.logger.debug('Database connection is healthy', 'HealthService');
      return {
        status: 'ok',
        message: 'Database connection is healthy',
      };
    } catch (error) {
      this.metricsService.increment('health.database.failure');
      if (error instanceof Error) {
        this.logger.logError(error, 'HealthService');
        throw new DatabaseError(
          `Database connection failed: ${error.message}`,
          'DB_CONNECTION_FAILED',
        );
      }
      throw new DatabaseError(
        'Database connection failed: Unknown error',
        'DB_CONNECTION_FAILED',
      );
    }
  }

  private async checkRedis() {
    try {
      await retry(
        async () => {
          await this.redis.ping();
        },
        3,
        1000,
        this.nestLogger,
      );
      this.metricsService.increment('health.redis.success');
      this.logger.debug('Redis connection is healthy', 'HealthService');
      return {
        status: 'ok',
        message: 'Redis connection is healthy',
      };
    } catch (error) {
      this.metricsService.increment('health.redis.failure');
      if (error instanceof Error) {
        this.logger.logError(error, 'HealthService');
        throw new RedisError(
          `Redis connection failed: ${error.message}`,
          'REDIS_CONNECTION_FAILED',
        );
      }
      throw new RedisError(
        'Redis connection failed: Unknown error',
        'REDIS_CONNECTION_FAILED',
      );
    }
  }

  async checkAllServices() {
    this.metricsService.increment('health.checks.total');
    const startTime = Date.now();

    try {
      const [database, redis] = await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
      ]);

      const duration = Date.now() - startTime;
      this.metricsService.set('health.checks.duration', duration);

      this.logger.debug(
        `Health check completed in ${duration}ms`,
        'HealthService',
      );

      return {
        database,
        redis,
        timestamp: new Date().toISOString(),
        service: 'backend',
        version: process.env.npm_package_version || '1.0.0',
        environment: this.configService.get('NODE_ENV'),
        uptime: process.uptime(),
        duration,
      };
    } catch (error) {
      this.metricsService.increment('health.checks.failure');
      if (error instanceof Error) {
        this.logger.logError(error, 'HealthService');
      }
      throw new RateLimitError(
        'Service temporarily unavailable',
        'SERVICE_UNAVAILABLE',
        {
          retryAfter: '30',
        },
      );
    }
  }

  async getHealthStatus() {
    return this.checkAllServices();
  }
}
