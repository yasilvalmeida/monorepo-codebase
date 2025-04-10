import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmSignUpDto, LoginDto, SignUpDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from 'src/shared/decorators/logged-user.decorator';
import { RetrieveLoggedUserResponseDto } from 'src/module/users/dto/user.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60, limit: 3 } })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('confirmation')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60, limit: 3 } })
  async confirmation(@Body() confirmSignUpDto: ConfirmSignUpDto) {
    return this.authService.confirmation(confirmSignUpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60, limit: 5 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60, limit: 5 } })
  async refreshToken(@LoggedUser() loggedUser: RetrieveLoggedUserResponseDto) {
    return this.authService.refreshToken(loggedUser);
  }
}
