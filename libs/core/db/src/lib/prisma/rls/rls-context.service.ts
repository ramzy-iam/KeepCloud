import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface RLSContext {
  prisma?: PrismaClient;
}

@Injectable()
export class RLSContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<RLSContext>();

  static getContext(): RLSContext {
    return this.asyncLocalStorage.getStore() || {};
  }

  static get prisma(): PrismaClient {
    const context = this.getContext();
    if (!context.prisma) {
      throw new Error('Prisma client is not set in the context');
    }

    return context.prisma;
  }

  static set prisma(prisma: PrismaClient) {
    this.updateContext({ prisma });
  }

  // Set context for the current async operation
  static runWithContext<T>(context: RLSContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  static updateContext(updates: Partial<RLSContext>): void {
    const current = this.getContext();
    Object.assign(current, updates);
  }
}
