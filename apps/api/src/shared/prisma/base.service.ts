import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';

type ModelName = keyof Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$queryRaw'
  | '$queryRawUnsafe'
  | '$transaction'
  | '$use'
  | '$on'
>;

@Injectable()
export class BaseService<T extends ModelName> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: T,
  ) {}

  async create(data: Prisma.Args<PrismaClient[T], 'create'>['data']) {
    return (this.prisma[this.model] as any).create({ data });
  }

  async findMany(
    params: Prisma.Args<PrismaClient[T], 'findMany'> = {} as Prisma.Args<
      PrismaClient[T],
      'findMany'
    >,
  ) {
    return (this.prisma[this.model] as any).findMany(params);
  }

  async findUnique(params: Prisma.Args<PrismaClient[T], 'findUnique'>) {
    return (this.prisma[this.model] as any).findUnique(params);
  }

  async update(params: {
    where: Prisma.Args<PrismaClient[T], 'update'>['where'];
    data: Prisma.Args<PrismaClient[T], 'update'>['data'];
  }) {
    return (this.prisma[this.model] as any).update(params);
  }

  async delete(params: Prisma.Args<PrismaClient[T], 'delete'>) {
    return (this.prisma[this.model] as any).delete(params);
  }

  async count(
    params: Prisma.Args<PrismaClient[T], 'count'> = {} as Prisma.Args<
      PrismaClient[T],
      'count'
    >,
  ) {
    return (this.prisma[this.model] as any).count(params);
  }
}
