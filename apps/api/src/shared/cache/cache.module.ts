import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        socket: {
          host: config.get('REDIS_HOST'),
          port: +config.get('REDIS_PORT'),
        },
        password: config.get('REDIS_PASSWORD'),
        ttl: config.get('CACHE_TTL') || 60, // seconds
        max: config.get('CACHE_MAX_ITEMS') || 1000,
        isGlobal: true,
      }),
    }),
  ],
  exports: [CacheModule, CacheService],
  providers: [CacheService],
})
export class RedisCacheModule {}
