import { Injectable } from '@nestjs/common';
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
  Prisma.SubscriptionPlanInclude,
  PrismaService['subscriptionPlan']
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
