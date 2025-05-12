import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { User } from '../../entities';
import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base';
import { UserScope } from './user.scope';

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
    return new UserScope(this.prisma, this);
  }
}
