import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { bypassRLS, forUser } from './extensions';
import { RLSContextService } from './rls';
import * as runtime from '@prisma/client/runtime/library';

import $Utils = runtime.Types.Utils;

// @Injectable()
// export class PrismaService implements OnModuleInit, OnModuleDestroy {
//   private baseClient: PrismaClient;
//   private clientCache = new Map<string, PrismaClient>();
//   constructor() {
//     this.baseClient = new PrismaClient();
//   }

//   async onModuleInit() {
//     await this.baseClient.$connect();
//   }

//   async onModuleDestroy() {
//     await this.baseClient.$disconnect();
//     this.clientCache.clear();
//   }

//   // Factory method to get context-aware client
//   private get _client() {
//     const context = RLSContextService.getContext();
//     const userId = context.userId ?? 'anonymous';
//     const shouldByPass = context.bypassRLS ?? false;

//     console.log({ userId });

//     // Create cache key based on context
//     const cacheKey = `${userId}:${bypassRLS}`;

//     if (!this.clientCache.has(cacheKey)) {
//       let client = this.baseClient;

//       if (shouldByPass) {
//         client = client.$extends(bypassRLS()) as PrismaClient;
//       }

//       if (userId && userId !== 'anonymous') {
//         client = client.$extends(forUser(userId)) as PrismaClient;
//       }

//       this.clientCache.set(cacheKey, client);
//     }

//     return this.clientCache.get(cacheKey) as PrismaClient;
//   }

//   get user(): Prisma.UserDelegate {
//     return this._client.user;
//   }

//   get file(): Prisma.FileDelegate {
//     return this._client.file;
//   }

//   get subscriptionPlan(): Prisma.SubscriptionPlanDelegate {
//     return this._client.subscriptionPlan;
//   }

//   get $transaction(): {
//     <P extends Prisma.PrismaPromise<any>[]>(
//       arg: [...P],
//       options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
//     ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

//     <R>(
//       fn: (prisma: Prisma.TransactionClient) => Promise<R>,
//       options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
//     ): Promise<R>;
//   } {
//     const client = this._client;
//     return this._client.$transaction.bind(client);
//   }

//   get $queryRaw() {
//     const client = this._client;
//     return client.$queryRaw.bind(client);
//   }

//   get $executeRaw() {
//     const client = this._client;
//     return client.$executeRaw.bind(client);
//   }

//   get $connect() {
//     return this.baseClient.$connect.bind(this.baseClient);
//   }
//   get $disconnect() {
//     return this.baseClient.$disconnect.bind(this.baseClient);
//   }
// }

// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private baseClient: PrismaClient;
  private clientCache = new Map<string, PrismaClient>();

  // Create a dynamic proxy
  private _proxy: PrismaClient;

  constructor() {
    this.baseClient = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    }).$extends(forUser()) as PrismaClient;

    this._proxy = this.createProxy();
  }

  private createProxy(): PrismaClient {
    return new Proxy({} as PrismaClient, {
      get: (_, prop) => {
        // Special handling for transaction
        if (prop === '$transaction') {
          return this.getTransactionHandler();
        }

        // Special handling for connect/disconnect
        if (prop === '$connect' || prop === '$disconnect') {
          return this.baseClient[prop].bind(this.baseClient);
        }

        // For all other properties/methods
        const client = this.getContextAwareClient();
        return Reflect.get(client, prop);
      },
    });
  }

  private getTransactionHandler() {
    const client = this.getContextAwareClient();
    return client.$transaction.bind(client);
  }

  private getContextAwareClient(): PrismaClient {
    const context = RLSContextService.getContext();
    const userId = context.userId ?? 'anonymous';
    const shouldByPass = context.bypassRLS ?? false;
    const cacheKey = `${userId}:${shouldByPass}`;
    console.log({ userId, shouldByPass });
    if (!this.clientCache.has(cacheKey)) {
      let client = this.baseClient;

      // if (shouldByPass) {
      //   client = client.$extends(bypassRLS()) as PrismaClient;
      // } else if (userId !== 'anonymous') {
      //   client = client.$extends(forUser()) as PrismaClient;
      // }
      console.log({ cacheKey });
      this.clientCache.set(cacheKey, client);
    }

    return this.clientCache.get(cacheKey)!;
  }

  get user(): Prisma.UserDelegate {
    return this.getContextAwareClient().user;
  }

  // Single access point for the proxied client
  get client(): PrismaClient {
    return this._proxy;
  }

  // Lifecycle methods remain the same
  async onModuleInit() {
    // const client = new PrismaClient().$extends(forUser());

    await this.baseClient.$connect();
    // await client.file.findFirst();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
    this.clientCache.clear();
  }
}
