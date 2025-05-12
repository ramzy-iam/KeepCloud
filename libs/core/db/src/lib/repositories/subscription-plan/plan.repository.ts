import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { BaseRepository } from '../base';
import { SubscriptionPlan } from '../../entities';
import { Prisma } from '@prisma/client';
import { SubscriptionPlanScope } from './plan.scope';

@Injectable()
export class SubscriptionPlanRepository extends BaseRepository<
  SubscriptionPlan,
  Prisma.SubscriptionPlanCreateInput,
  Prisma.SubscriptionPlanUpdateInput,
  Prisma.SubscriptionPlanWhereUniqueInput,
  Prisma.SubscriptionPlanWhereInput,
  Prisma.SubscriptionPlanInclude,
  PrismaService['subscriptionPlan']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.subscriptionPlan);
  }

  get scoped() {
    return new SubscriptionPlanScope(this.prisma, this);
  }
}
