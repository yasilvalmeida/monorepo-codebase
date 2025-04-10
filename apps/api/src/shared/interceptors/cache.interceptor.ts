import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const customKey = this.reflector.get<string>(
      'cache-key',
      context.getHandler(),
    );
    const ttl =
      this.reflector.get<number>('cache-ttl', context.getHandler()) || 60;

    const key = customKey || this.generateCacheKey(request);
    const cached = await this.cacheManager.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (response) => {
        if (response) {
          await this.cacheManager.set(key, response, ttl * 1000);
        }
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const { method, url, params, query, body } = request;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(
      query,
    )}:${JSON.stringify(body)}`;
  }
}
