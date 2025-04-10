import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../config/types';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metrics: Map<string, number> = new Map();

  constructor(private readonly configService: ConfigService<Configuration>) {}

  increment(metric: string, value = 1) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
    this.logger.debug(`Metric ${metric} incremented by ${value}`);
  }

  decrement(metric: string, value = 1) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, Math.max(0, current - value));
    this.logger.debug(`Metric ${metric} decremented by ${value}`);
  }

  set(metric: string, value: number) {
    this.metrics.set(metric, value);
    this.logger.debug(`Metric ${metric} set to ${value}`);
  }

  get(metric: string): number {
    return this.metrics.get(metric) || 0;
  }

  getAll(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(metric?: string) {
    if (metric) {
      this.metrics.delete(metric);
      this.logger.debug(`Metric ${metric} reset`);
    } else {
      this.metrics.clear();
      this.logger.debug('All metrics reset');
    }
  }
}
