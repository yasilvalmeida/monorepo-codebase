import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/prisma/base.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Role, User } from '../../../node_modules/@prisma/client/index';
import { CacheService } from '../../shared/cache/cache.service';
import {
  CreateUserDto,
  PaginationUserRequestDto,
  RetrieveLoggedUserResponseDto,
  RetrieveUserResponseDto,
  UpdateUserDto,
} from './dto/user.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class UsersService extends BaseService<'user'> {
  constructor(
    protected readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {
    super(prismaService, 'user');
  }

  async findById(id: string): Promise<User> {
    const cacheKey = `user:id:${id}`;

    return this.cacheService.wrap(
      cacheKey,
      () => this.findUnique({ where: { id } }),
      3600,
    );
  }

  async findByEmail(email: string): Promise<User> {
    const cacheKey = `user:email:${email}`;

    return this.cacheService.wrap(
      cacheKey,
      () => this.findUnique({ where: { email } }),
      3600,
    );
  }

  async createUser(data: CreateUserDto) {
    const user = await this.create(data);
    await this.invalidateUserCache(user);
    return user;
  }

  async updateUser(data: UpdateUserDto) {
    const { id, firstName, lastName, email, role, refreshToken, status } = data;
    const user = await this.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        role: role as Role,
        refreshToken,
        status,
      },
    });
    await this.invalidateUserCache(user);
    return user;
  }

  async activateOrInactiveUser(id: string, status: boolean) {
    const user = await this.update({
      where: { id },
      data: {
        status,
      },
    });
    await this.invalidateUserCache(user);
    return user;
  }

  private async invalidateUserCache(user: User) {
    await Promise.all([
      this.cacheService.del(`user:id:${user.id}`),
      this.cacheService.del(`user:email:${user.email}`),
      this.cacheService.del(`user:find-all`),
    ]);
  }

  async findAll(
    loggedUser: RetrieveLoggedUserResponseDto,
    {
      paged,
      limit,
      offset,
      sortBy,
      sortDirection,
      firstName,
      lastName,
      email,
      status,
      role,
      createdAtMin,
      createdAtMax,
    }: PaginationUserRequestDto,
  ): Promise<PaginationResponseDto<RetrieveUserResponseDto>> {
    const createdAt =
      createdAtMin || createdAtMax
        ? {
            ...(createdAtMin && {
              gte: createdAtMin,
            }),
            ...(createdAtMax && {
              lte: createdAtMax,
            }),
          }
        : undefined;
    const where: any = {
      ...(firstName && {
        firstName: { contains: firstName, mode: 'insensitive' },
      }),
      ...(lastName && {
        lastName: { contains: lastName, mode: 'insensitive' },
      }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(status && { status }),
      ...(role && { role: role as Role }),
      ...(createdAt && { createdAt }),
    };
    const body = {
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
      where,
    };
    if (paged) {
      body['skip'] = offset ? (offset - 1) * (limit || 10) : 0;
      body['take'] = limit ? limit : 10;
      body['orderBy'] = [
        {
          [sortBy ? sortBy : 'createdAt']: sortDirection
            ? sortDirection
            : 'desc',
        },
      ];
    }

    const cacheKey = `user:find-all`;

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const [total, results] = await this.prismaService.$transaction([
          this.prismaService.user.count({ where }),
          this.prismaService.user.findMany({
            ...body,
          }),
        ]);

        return {
          total,
          limit: paged ? limit : total,
          offset: paged ? offset : 1,
          results,
        };
      },
      3600,
    );
  }
}
