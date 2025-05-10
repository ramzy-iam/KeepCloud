import { Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base';

export class UserScope extends BaseScope<
  User,
  Prisma.UserWhereInput,
  Prisma.UserInclude,
  PrismaClient['user']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.user);
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
