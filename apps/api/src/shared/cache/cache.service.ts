import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {}

  // Generic cache wrapper with TTL
  async wrap<T>(key: string, fn: () => Promise<T>, ttl: number): Promise<T> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        this.logger.debug(`Cache hit for key: ${key}`, 'CacheService');
        return cached as T;
      }

      this.logger.debug(`Cache miss for key: ${key}`, 'CacheService');
      const result = await fn();
      await this.redisService.set(key, result, ttl);
      return result;
    } catch (error: any) {
      this.logger.error(
        `Error in cache wrap for key ${key}`,
        error.stack,
        'CacheService',
      );
      return fn();
    }
  }

  // User-specific caching
  async wrapUser<T>(
    userId: string,
    fn: () => Promise<T>,
    ttl = 3600,
  ): Promise<T> {
    return this.wrap(`user:${userId}`, fn, ttl);
  }

  // Course-specific caching
  async wrapCourse<T>(
    courseId: string,
    fn: () => Promise<T>,
    ttl = 3600,
  ): Promise<T> {
    return this.wrap(`course:${courseId}`, fn, ttl);
  }

  // Assignment-specific caching
  async wrapAssignment<T>(
    assignmentId: string,
    fn: () => Promise<T>,
    ttl = 3600,
  ): Promise<T> {
    return this.wrap(`assignment:${assignmentId}`, fn, ttl);
  }

  // File-specific caching
  async wrapFile<T>(
    fileId: string,
    fn: () => Promise<T>,
    ttl = 3600,
  ): Promise<T> {
    return this.wrap(`file:${fileId}`, fn, ttl);
  }

  // Delete a specific key
  async del(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
      this.logger.debug(`Deleted cache key: ${key}`, 'CacheService');
    } catch (error: any) {
      this.logger.error(
        `Error deleting cache key ${key}`,
        error.stack,
        'CacheService',
      );
    }
  }

  // Pattern-based cache invalidation
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisService.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisService.del(key)));
        this.logger.debug(
          `Invalidated ${keys.length} keys matching pattern: ${pattern}`,
          'CacheService',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error invalidating pattern ${pattern}`,
        error.stack,
        'CacheService',
      );
    }
  }

  // User-related cache invalidation
  async invalidateUser(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}*`);
  }

  // Course-related cache invalidation
  async invalidateCourse(courseId: string): Promise<void> {
    await this.invalidatePattern(`course:${courseId}*`);
  }

  // Assignment-related cache invalidation
  async invalidateAssignment(assignmentId: string): Promise<void> {
    await this.invalidatePattern(`assignment:${assignmentId}*`);
  }

  // File-related cache invalidation
  async invalidateFile(fileId: string): Promise<void> {
    await this.invalidatePattern(`file:${fileId}*`);
  }

  // Batch cache operations
  async wrapBatch<T>(
    keys: string[],
    fn: (missingKeys: string[]) => Promise<Record<string, T>>,
    ttl = 3600,
  ): Promise<Record<string, T>> {
    try {
      const cached = await this.redisService.mget(keys);
      const result: Record<string, T> = {};
      const missingKeys: string[] = [];

      keys.forEach((key, index) => {
        if (cached[index]) {
          result[key] = cached[index] as T;
        } else {
          missingKeys.push(key);
        }
      });

      if (missingKeys.length > 0) {
        const newData = await fn(missingKeys);
        const entries = Object.entries(newData).map(([key, value]) => ({
          key,
          value,
          ttl,
        }));
        await this.redisService.mset(entries);
        Object.assign(result, newData);
      }

      return result;
    } catch (error: any) {
      this.logger.error(
        'Error in batch cache wrap',
        error.stack,
        'CacheService',
      );
      return fn(keys);
    }
  }
}
