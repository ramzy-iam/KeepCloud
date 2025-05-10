import { Injectable } from '@nestjs/common';
import { UserScope } from './user.scope';
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
  PrismaClient['user'],
  UserScope
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.user, new UserScope(prisma));
  }
}
