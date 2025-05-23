import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

export interface RLSContext {
  userId?: string;
  bypassRLS?: boolean;
}

export class RLSContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<RLSContext>();

  static getContext(): RLSContext {
    return this.asyncLocalStorage.getStore() || {};
  }

  // Set context for the current async operation
  static runWithContext<T>(context: RLSContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  static getCurrentUserId(): string | undefined {
    return this.getContext().userId;
  }

  static updateContext(updates: Partial<RLSContext>): void {
    const current = this.getContext();
    Object.assign(current, updates);
  }

  static setUserId(userId: string): void {
    this.updateContext({ userId, bypassRLS: false });
  }

  // Set system context (bypass RLS)
  static byPassRLS(): void {
    this.updateContext({ bypassRLS: true });
  }
}
