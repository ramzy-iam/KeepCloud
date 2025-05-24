import { Injectable } from '@nestjs/common';
import { Prisma, SubscriptionPlan } from '@prisma/client';
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
  Prisma.SubscriptionPlanOrderByWithRelationInput
> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected repository: SubscriptionPlanRepository,
  ) {
    super(prismaService, repository);
  }

  filterByDefault() {
    this._where.isDefault = true;
    return this;
  }
}
