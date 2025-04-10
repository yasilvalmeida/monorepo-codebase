import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { SetMetadata } from '@nestjs/common';

export function CacheDecorator(key?: string, ttl?: number) {
  return applyDecorators(
    SetMetadata('cache-key', key),
    SetMetadata('cache-ttl', ttl),
    UseInterceptors(CacheInterceptor),
  );
}
