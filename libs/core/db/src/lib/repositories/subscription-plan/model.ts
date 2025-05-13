import { SubscriptionPlan } from '../../entities';
import { GenericPrismaModel } from '../base/model';
import { Prisma } from '../../prisma';

export type SubscriptionPlanModel = GenericPrismaModel<
  SubscriptionPlan,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserInclude,
  Prisma.UserOrderByWithRelationInput
>;
