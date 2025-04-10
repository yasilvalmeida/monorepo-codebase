import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from 'src/shared/errors/custom.errors';
import { UsersService } from '../users/users.service';
import {
  ConfirmSignUpDto,
  LoginDto,
  LoginResponseDto,
  SignUpDto,
} from './dto/auth.dto';
import { MessageDto } from 'src/shared/dto/message.dto';
import { ConfigService } from '@nestjs/config';
import { RetrieveLoggedUserResponseDto } from 'src/module/users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<MessageDto> {
    const { email, password, firstName, lastName } = signUpDto;
    if (!email || !password || !firstName) {
      throw new NotFoundException(
        'Email, password, and first name are required',
      );
    }

    try {
      let user = await this.usersService.findByEmail(email);
      if (!user) {
        user = await this.usersService.createUser({
          email,
          firstName,
          lastName,
        });
      }
      return {
        message:
          'Your user account was created, please check you inbox and get the confirmation code',
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmation(confirmSignUpDto: ConfirmSignUpDto): Promise<MessageDto> {
    const { email, code } = confirmSignUpDto;
    if (!email || !code) {
      throw new NotFoundException('Email, and confirmation code are required');
    }

    try {
      let user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found for this email');
      } else {
        const { id } = user;
        user = await this.usersService.activateOrInactiveUser(id, true);
      }
      return {
        message: 'User account confirmed',
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    if (!email || !password) {
      throw new NotFoundException('Email and password are required');
    }

    try {
      let user = await this.usersService.findByEmail(email);
      if (!user) throw new NotFoundException('User not found in our database');

      const { id, firstName, lastName, role } = user;

      const tokens = await this.getTokens(id, email, role);

      user = await this.usersService.updateUser({
        id,
        firstName,
        lastName,
        email,
        role,
        refreshToken: tokens.refreshToken,
      });

      return tokens;
    } catch (error) {
      throw error;
    }
  }

  private async getTokens(id: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(loggedUser: RetrieveLoggedUserResponseDto) {
    if (!loggedUser) {
      throw new UnauthorizedException('No logged user');
    }

    try {
      const { id, email, role } = loggedUser;
      const tokens = await this.getTokens(id, email, role);
      await this.usersService.updateUser({
        ...loggedUser,
        refreshToken: tokens.refreshToken,
      });
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
