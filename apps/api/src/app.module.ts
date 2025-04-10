import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { LoggerModule } from './shared/logger/logger.module';
import { RedisCacheModule } from './shared/cache/cache.module';

import { CoreModule } from './shared/core/core.module';
import { configuration } from './shared/config/configuration';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { QueueModule } from './shared/queue/queue.module';
import { MailModule } from './shared/mail/mail.module';
import { MetricsModule } from './shared/metrics/metrics.module';

import { AuthModule } from './module/auth/auth.module';
import { AuthMiddleware } from './module/auth/auth.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    CoreModule,
    RedisCacheModule,
    PrismaModule,
    RedisModule,
    MetricsModule,
    QueueModule,
    MailModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/api/auth/signup', method: RequestMethod.POST },
        { path: '/api/auth/confirmation', method: RequestMethod.POST },
        { path: '/api/auth/login', method: RequestMethod.POST },
        { path: '/api/health', method: RequestMethod.GET },
        { path: '/api/newsletter', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
