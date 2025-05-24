import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { bypassRLS, forUser } from './extensions';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly baseClient: PrismaClient;

  constructor() {
    this.baseClient = new PrismaClient();
  }

  onModuleInit() {
    return this.baseClient.$connect();
  }

  onModuleDestroy() {
    return this.baseClient.$disconnect();
  }

  /**
   * Returns a scoped PrismaClient for a specific user.
   * If no userId is provided, bypasses RLS.
   */
  getClient(userId?: string): PrismaClient {
    const extension = userId ? forUser(userId) : bypassRLS();
    return this.baseClient.$extends(extension) as PrismaClient;
  }

  /**
   * Access the raw PrismaClient without RLS.
   */
  get raw(): PrismaClient {
    return this.baseClient;
  }
}
