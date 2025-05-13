import { User } from '../../entities';
import { Prisma } from '../../prisma';
import { GenericPrismaModel } from '../base/model';

export type UserModel = GenericPrismaModel<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserInclude,
  Prisma.UserOrderByWithRelationInput
>;
