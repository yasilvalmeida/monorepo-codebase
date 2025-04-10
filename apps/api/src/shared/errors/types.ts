export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DatabaseError extends BaseError {
  constructor(
    message: string,
    code = 'DATABASE_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 500);
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(details?: Record<string, any>) {
    super(
      'Failed to connect to database',
      'DATABASE_CONNECTION_ERROR',
      details,
    );
  }
}

export class DatabaseQueryError extends DatabaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_QUERY_ERROR', details);
  }
}

export class RedisError extends BaseError {
  constructor(
    message: string,
    code = 'REDIS_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 500);
  }
}

export class CacheConnectionError extends RedisError {
  constructor(details?: Record<string, any>) {
    super('Failed to connect to Redis', 'CACHE_CONNECTION_ERROR', details);
  }
}

export class CacheOperationError extends RedisError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CACHE_OPERATION_ERROR', details);
  }
}

export class AwsError extends BaseError {
  constructor(
    message: string,
    code = 'AWS_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 500);
  }
}

export class CognitoError extends AwsError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'COGNITO_ERROR', details);
  }
}

export class S3Error extends AwsError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'S3_ERROR', details);
  }
}

export class StripeError extends BaseError {
  constructor(
    message: string,
    code = 'STRIPE_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 500);
  }
}

export class CanvasError extends BaseError {
  constructor(
    message: string,
    code = 'CANVAS_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 500);
  }
}

export class ValidationError extends BaseError {
  constructor(
    message: string,
    code = 'VALIDATION_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 400);
  }
}

export class AuthenticationError extends BaseError {
  constructor(
    message: string,
    code = 'AUTHENTICATION_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 401);
  }
}

export class AuthorizationError extends BaseError {
  constructor(
    message: string,
    code = 'AUTHORIZATION_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 403);
  }
}

export class RateLimitError extends BaseError {
  constructor(
    message: string,
    code = 'RATE_LIMIT_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 429);
  }
}

export class ResourceNotFoundError extends BaseError {
  constructor(
    message: string,
    code = 'RESOURCE_NOT_FOUND',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(
    message: string,
    code = 'CONFLICT_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 409);
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(
    message: string,
    code = 'SERVICE_UNAVAILABLE',
    details?: Record<string, any>,
  ) {
    super(message, code, details, 503);
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeout?: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string, public readonly key?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class FileSystemError extends Error {
  constructor(message: string, public readonly path?: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class CacheError extends Error {
  constructor(message: string, public readonly key?: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export class QueueError extends Error {
  constructor(message: string, public readonly queue?: string) {
    super(message);
    this.name = 'QueueError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public readonly service?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}
