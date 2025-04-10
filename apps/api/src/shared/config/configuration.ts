import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

// Validation schemas
const urlSchema = Joi.string().uri().required();
const passwordSchema = Joi.string().min(8).required();
const jwtAccessSecretSchema = Joi.string().min(32).required();
const jwtRefreshSecretSchema = Joi.string().min(32).required();
const awsRegionSchema = Joi.string()
  .pattern(/^[a-z]{2}-[a-z]+-\d{1}$/)
  .required();

export const configuration = (): ConfigModuleOptions => ({
  isGlobal: true,
  validationSchema: Joi.object({
    // Environment
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(5000),
    CORS_ORIGINS: Joi.string().required(),

    // Security
    HELMET_ENABLED: Joi.boolean().default(true),
    COMPRESSION_ENABLED: Joi.boolean().default(true),
    RATE_LIMIT_WINDOW: Joi.number().min(1).default(15),
    RATE_LIMIT_MAX: Joi.number().min(1).default(100),

    // Database
    POSTGRES_HOST: Joi.string().hostname().required(),
    POSTGRES_PORT: Joi.number().port().default(5432),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: passwordSchema,
    POSTGRES_DB: Joi.string().required(),
    DATABASE_URL: urlSchema,

    // Redis
    REDIS_HOST: Joi.string().hostname().required(),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: passwordSchema,
    REDIS_URL: urlSchema,

    // JWT
    JWT_ACCESS_SECRET: jwtAccessSecretSchema,
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: jwtRefreshSecretSchema,
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('1d'),

    // Cache
    CACHE_MAX_ITEMS: Joi.number().min(100).default(1000),
    CACHE_TTL: Joi.number().min(60).default(3600),

    // Mail
    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().required(),
    MAIL_USER: Joi.string().required(),
    MAIL_PASSWORD: Joi.string().required(),
    MAIL_FROM: Joi.string().required(),
  }),
  validationOptions: {
    abortEarly: false,
  },
});
