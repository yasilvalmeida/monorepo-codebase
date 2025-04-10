export interface DatabaseConfig {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  DATABASE_URL: string;
}

export interface RedisConfig {
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: number;
  REDIS_URL: string;
}

export interface JwtConfig {
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
}

export interface CacheConfig {
  CACHE_MAX_ITEMS: number;
  CACHE_TTL: number;
}

export interface AppConfig {
  ALLOWED_ORIGINS: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CLOUDWATCH_LOG_LEVEL: string;
}

export interface MailConfig {
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASSWORD: string;
  MAIL_FROM: string;
}

export type Configuration = DatabaseConfig &
  RedisConfig &
  JwtConfig &
  CacheConfig &
  AppConfig;
