import { Prisma } from '@prisma/client';
import { RLSContextService } from '../rls';

export function bypassRLS() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    }),
  );
}

export function forUser() {
  const context = RLSContextService.getContext();
  const userId = context.userId ?? 'anonymous';
  console.log(`RLSContextService.getContext: ${JSON.stringify(context)}`);
  console.log(`forUser: ${userId}`);
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [setting, check, result] = await prisma.$transaction([
              prisma.$queryRaw`SELECT set_config('app.current_user_id', ${userId}, TRUE)`,
              prisma.$queryRaw`SELECT current_setting('app.current_user_id', TRUE)`,
              query(args),
            ]);
            console.log({ setting, check, result });
            return result;
          },
        },
      },
    });
  });
}
