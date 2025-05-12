import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base/base.scope';
import { SubscriptionPlanRepository } from './plan.repository';

@Injectable()
export class SubscriptionPlanScope extends BaseScope<
  SubscriptionPlan,
  Prisma.SubscriptionPlanCreateInput,
  Prisma.SubscriptionPlanUpdateInput,
  Prisma.SubscriptionPlanWhereUniqueInput,
  Prisma.SubscriptionPlanWhereInput,
  Prisma.SubscriptionPlanInclude,
  PrismaClient['subscriptionPlan']
> {
  constructor(
    protected readonly prisma: PrismaService,
    repository: SubscriptionPlanRepository,
  ) {
    super(prisma, prisma.subscriptionPlan, repository);
  }

  filterByDefault() {
    this._where.isDefault = true;
    return this;
  }
}
