import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base/base.scope';
import { UserRepository } from './user.repository';

@Injectable()
export class UserScope extends BaseScope<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserInclude,
  PrismaClient['user']
> {
  constructor(
    protected readonly prisma: PrismaService,
    repository: UserRepository,
  ) {
    super(prisma, prisma.user, repository);
  }

  filterByEmail(email: string) {
    this._where.email = email;
    return this;
  }
}
