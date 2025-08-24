import { createApp } from './bootstrap';
import { ProcessorProvider } from '@keepcloud/core/services';

export async function initAppAndExecuteProcessor(
  message: string,
  data: unknown,
) {
  const app = await createApp();
  const processorProvider = app.get(ProcessorProvider);
  const processor = processorProvider.getFromMessage(message);
  return await processor.execute(data);
}
