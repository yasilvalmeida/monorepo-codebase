import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from '../../module/auth/strategies/jwt.strategy';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtStrategy,
    },
  ],
})
export class CoreModule {}
