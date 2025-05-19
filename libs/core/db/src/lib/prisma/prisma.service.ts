import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Scope,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { bypassRLS, forUser } from './extensions';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(REQUEST)
    private readonly request: Request & { user?: { sub: string } },
  ) {
    const userId = request?.user?.sub ?? 'anonymous'; //TODO: inject the userId from the request

    const extendedClient = new PrismaClient()
      .$extends(bypassRLS())
      .$extends(forUser(userId));

    super();
    Object.assign(this, extendedClient);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
