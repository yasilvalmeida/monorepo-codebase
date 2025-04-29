import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RedisService {
  private client;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const redisOptions = {
      url: this.configService.get('REDIS_URL'),
    };
    this.client = createClient(redisOptions);

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err, 'RedisService');
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected', 'RedisService');
    });

    this.client.connect();
  }

  async ping() {
    return this.client.ping();
  }

  async get(key: string) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error: any) {
      this.logger.error(
        `Error getting key ${key}`,
        error.stack,
        'RedisService',
      );
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number) {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error: any) {
      this.logger.error(
        `Error setting key ${key}`,
        error.stack,
        'RedisService',
      );
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
    } catch (error: any) {
      this.logger.error(
        `Error deleting key ${key}`,
        error.stack,
        'RedisService',
      );
    }
  }

  async keys(pattern: string) {
    try {
      return await this.client.keys(pattern);
    } catch (error: any) {
      this.logger.error(
        `Error getting keys with pattern ${pattern}`,
        error.stack,
        'RedisService',
      );
      return [];
    }
  }

  async mget(keys: string[]) {
    try {
      const values = await this.client.mGet(keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error: any) {
      this.logger.error('Error in mget operation', error.stack, 'RedisService');
      return keys.map(() => null);
    }
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>) {
    try {
      const pipeline = this.client.multi();
      for (const { key, value, ttl } of entries) {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setEx(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      }
      await pipeline.exec();
    } catch (error: any) {
      this.logger.error('Error in mset operation', error.stack, 'RedisService');
    }
  }

  async exists(key: string) {
    try {
      return await this.client.exists(key);
    } catch (error: any) {
      this.logger.error(
        `Error checking existence of key ${key}`,
        error.stack,
        'RedisService',
      );
      return false;
    }
  }

  async ttl(key: string) {
    try {
      return await this.client.ttl(key);
    } catch (error: any) {
      this.logger.error(
        `Error getting TTL for key ${key}`,
        error.stack,
        'RedisService',
      );
      return -2; // Key doesn't exist
    }
  }

  async flushAll() {
    try {
      await this.client.flushAll();
    } catch (error: any) {
      this.logger.error('Error flushing all keys', error.stack, 'RedisService');
    }
  }
}
