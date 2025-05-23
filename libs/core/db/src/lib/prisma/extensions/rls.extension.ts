import { Prisma } from '@prisma/client';

export function bypassRLS() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$queryRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
              query(args),
            ]);

            return result;
          },
        },
      },
    }),
  );
}

export function forUser(userId: string) {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$queryRaw`SELECT set_config('app.current_user_id', ${userId}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  });
}
