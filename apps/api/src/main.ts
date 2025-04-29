import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './shared/logger/logger.service';
import { RateLimitMiddleware } from './shared/middleware/rate-limit.middleware';
import { HttpExceptionFilter } from './shared/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Enable CORS
  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    methods: '*',
    exposedHeaders: 'X-Token-Expired',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global error handling
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Security middleware
  if (configService.get('HELMET_ENABLED')) {
    app.use(helmet());
  }

  // Compression middleware
  if (configService.get('COMPRESSION_ENABLED')) {
    app.use(compression());
  }

  // Rate limiting
  const rateLimitMiddleware = new RateLimitMiddleware(
    configService.get('RATE_LIMIT_WINDOW'),
    configService.get('RATE_LIMIT_MAX'),
  );
  app.use(rateLimitMiddleware.use.bind(rateLimitMiddleware));

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Base API')
      .setDescription('Base API documentation')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
        name: 'Authorization',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
      ignoreGlobalPrefix: true,
    });

    SwaggerModule.setup('api-docs', app, document, {
      customSiteTitle: 'Base API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
      },
    });
  }

  const port = configService.get('PORT');
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
