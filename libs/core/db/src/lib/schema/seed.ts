import { PrismaClient } from '@prisma/client';
import { Logger } from '@keepcloud/commons/backend';
const prisma = new PrismaClient();

async function main() {
  const existingPlans = await prisma.subscriptionPlan.count();
  if (existingPlans === 0) {
    await prisma.subscriptionPlan.createMany({
      data: [
        {
          nameKey: 'plan.free.name',
          descriptionKey: 'plan.free.description',
          maxStorage: 20 * Math.pow(1024, 2), // 20MB
          price: 0,
          isDefault: true,
        },
        {
          nameKey: 'plan.pro.name',
          descriptionKey: 'plan.pro.description',
          maxStorage: Math.pow(1024, 3), // 1GB
          price: 499, // $4.99
          isDefault: false,
        },
        {
          nameKey: 'plan.business.name',
          descriptionKey: 'plan.business.description',
          maxStorage: 10 * Math.pow(1024, 3), // 10GB
          price: 1999, // $19.99
          isDefault: false,
        },
      ],
    });
    Logger.info('Subscription plans seeded');
  } else {
    console.log('Subscription plans already exist, skipping seed.');
  }
}

main()
  .catch(Logger.error)
  .finally(() => prisma.$disconnect());
