import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { User } from '../../entities';
import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserInclude,
  PrismaClient['user']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.user);
  }

  get scoped() {
    return new UserRepository(this.prisma);
  }

  filterById(id: string) {
    this._where.id = id;
    return this;
  }

  filterByEmail(email: string) {
    this._where.email = email;
    return this;
  }
}
