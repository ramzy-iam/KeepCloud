import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { User } from '../../entities';
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
  Prisma.UserOrderByWithRelationInput
> {
  constructor(protected readonly prismaService: PrismaService) {
    super('user');
  }

  get scoped() {
    return new UserScope(this.prismaService, this);
  }
}
