import { Injectable } from '@nestjs/common';
import { SubscriptionPlanScope } from './plan.scope';
import { PrismaService } from '../../prisma';
import { BaseRepository } from '../base';
import { SubscriptionPlan } from '../../entities';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionPlanRepository extends BaseRepository<
  SubscriptionPlan,
  Prisma.SubscriptionPlanCreateInput,
  Prisma.SubscriptionPlanUpdateInput,
  Prisma.SubscriptionPlanWhereUniqueInput,
  Prisma.SubscriptionPlanWhereInput,
  PrismaService['subscriptionPlan'],
  SubscriptionPlanScope
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.subscriptionPlan, new SubscriptionPlanScope(prisma));
  }
}
