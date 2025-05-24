import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
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
  Prisma.UserOrderByWithRelationInput
> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected repository: UserRepository,
  ) {
    super(prismaService, repository);
  }

  filterByEmail(email: string) {
    this._where.email = email;
    return this;
  }

  joinSubscriptionPlan() {
    this._include.plan = true;
    return this;
  }
}
