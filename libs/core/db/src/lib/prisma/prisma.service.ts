import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly baseClient: PrismaClient;

  constructor() {
    this.baseClient = new PrismaClient();
  }

  get client(): PrismaClient {
    return this.baseClient;
  }

  onModuleInit() {
    return this.baseClient.$connect();
  }

  onModuleDestroy() {
    return this.baseClient.$disconnect();
  }
}
