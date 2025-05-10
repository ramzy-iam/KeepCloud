import { Prisma, PrismaClient, SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base';

export class SubscriptionPlanScope extends BaseScope<
  SubscriptionPlan,
  Prisma.SubscriptionPlanWhereInput,
  Prisma.SubscriptionPlanInclude,
  PrismaClient['subscriptionPlan']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.subscriptionPlan);
  }

  filterById(id: string) {
    this._where.id = id;
    return this;
  }

  filterByDefault() {
    this._where.isDefault = true;
    return this;
  }
}
