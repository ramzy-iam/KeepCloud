import { PrismaService, RLSContextService } from '@keepcloud/core/db';
import { createApp } from './bootstrap';
import { ProcessorProvider } from '@keepcloud/core/services';

export async function initAppAndExecuteProcessor(
  message: string,
  data: unknown,
) {
  const app = await createApp();
  const prismaService = app.get(PrismaService);
  return RLSContextService.runWithContext(
    {
      prisma: prismaService.getClient(),
      prismaWithoutRLS: prismaService.getClient(),
    },
    async () => {
      const processorProvider = app.get(ProcessorProvider);
      const processor = processorProvider.getFromMessage(message);
      return await processor.execute(data);
    },
  );
}
