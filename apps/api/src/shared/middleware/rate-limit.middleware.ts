import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors/types';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<
    string,
    { count: number; resetTime: number }
  >();

  constructor(
    private readonly windowMs: number,
    private readonly max: number,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - this.windowMs * 1000;

    // Clean up old entries
    for (const [ip, data] of this.store.entries()) {
      if (data.resetTime < windowStart) {
        this.store.delete(ip);
      }
    }

    const data = this.store.get(key) || { count: 0, resetTime: now };

    if (data.resetTime < windowStart) {
      data.count = 0;
      data.resetTime = now;
    }

    if (data.count >= this.max) {
      const retryAfter = Math.ceil(
        (data.resetTime + this.windowMs * 1000 - now) / 1000,
      );
      throw new RateLimitError('Too many requests', 'RATE_LIMIT_EXCEEDED', {
        retryAfter,
      });
    }

    data.count++;
    this.store.set(key, data);

    res.setHeader('X-RateLimit-Limit', this.max);
    res.setHeader('X-RateLimit-Remaining', this.max - data.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));

    next();
  }
}
