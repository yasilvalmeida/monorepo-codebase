import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RetrieveLoggedUserResponseDto } from 'src/module/users/dto/user.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';

interface RequestWithLoggerUser extends Request {
  loggedUser: RetrieveLoggedUserResponseDto;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}
  async use(req: RequestWithLoggerUser, res: Response, next: NextFunction) {
    const token =
      req.body?.token || req.query?.token || req.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException();
    }
    const tokenSplited = token.split(' ');
    const decode: any = await this.authService.decodeToken(tokenSplited[1]);
    const { id, iat, exp } = decode;
    const foundUser = await this.prismaService.user.findUnique({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        refreshToken: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    });
    req.loggedUser = { ...foundUser, iat, exp };
    next();
  }
}
