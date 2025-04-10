import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateUserDto,
  PaginationUserRequestDto,
  RetrieveLoggedUserResponseDto,
  RetrieveUserResponseDto,
} from './dto/user.dto';
import {
  ApiPaginatedResponse,
  PaginationResponseDto,
} from 'src/shared/dto/pagination.dto';
import { LoggedUser } from 'src/shared/decorators/logged-user.decorator';

@ApiTags('Users')
@Controller('api/users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiPaginatedResponse(RetrieveUserResponseDto)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @LoggedUser() loggedUser: RetrieveLoggedUserResponseDto,
    @Query() paginationQuery: PaginationUserRequestDto,
  ): Promise<PaginationResponseDto<RetrieveUserResponseDto>> {
    return this.usersService.findAll(loggedUser, paginationQuery);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60, limit: 3 } })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
