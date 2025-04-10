import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import {
  DatabaseError,
  RedisError,
  AwsError,
  StripeError,
  CanvasError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
} from '../errors/types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = (exception as Error).message;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      errorCode = (exceptionResponse as any).error || 'HTTP_EXCEPTION';
      details = (exceptionResponse as any).details;
    } else if (exception instanceof DatabaseError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorCode = 'DATABASE_ERROR';
      details = exception.details;
    } else if (exception instanceof RedisError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorCode = 'REDIS_ERROR';
      details = exception.details;
    } else if (exception instanceof AwsError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorCode = 'AWS_ERROR';
      details = exception.details;
    } else if (exception instanceof StripeError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorCode = 'STRIPE_ERROR';
      details = exception.details;
    } else if (exception instanceof CanvasError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      errorCode = 'CANVAS_ERROR';
      details = exception.details;
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = 'VALIDATION_ERROR';
      details = exception.details;
    } else if (exception instanceof AuthenticationError) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
      errorCode = 'AUTHENTICATION_ERROR';
      details = exception.details;
    } else if (exception instanceof AuthorizationError) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
      errorCode = 'AUTHORIZATION_ERROR';
      details = exception.details;
    } else if (exception instanceof RateLimitError) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = exception.message;
      errorCode = 'RATE_LIMIT_ERROR';
      details = exception.details;
    }

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
      'HttpExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
