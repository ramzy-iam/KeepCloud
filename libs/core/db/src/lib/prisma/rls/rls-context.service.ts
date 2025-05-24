import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from '@prisma/client';

export interface RLSContext {
  prisma?: PrismaClient;
  prismaWithoutRLS?: PrismaClient;
  userId?: string | null;
}

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

  static get prismaWithoutRLS(): PrismaClient | undefined {
    const context = this.getContext();
    if (!context.prismaWithoutRLS) {
      throw new Error('Prisma client without RLS is not set in the context');
    }

    return context.prismaWithoutRLS;
  }

  static set prismaWithoutRLS(prisma: PrismaClient) {
    this.updateContext({ prismaWithoutRLS: prisma });
  }

  static set prisma(prisma: PrismaClient) {
    this.updateContext({ prisma });
  }

  static set userId(userId: string) {
    this.updateContext({ userId });
  }

  static get userId(): string | null {
    const context = this.getContext();
    return context.userId ?? null;
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
