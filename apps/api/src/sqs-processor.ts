import { SQSEvent, SQSRecord } from 'aws-lambda';
import { initAppAndExecuteProcessor } from './init-processor';
import {
  InternalServerErrorException,
  Logger,
} from '@keepcloud/commons/backend';

export async function processSQSEvent(event: SQSEvent) {
  const logger = new Logger('ProcessSQSEvent');
  logger.info('Processing SQS event', { records: event.Records });
  const uniqueMessages: SQSRecord[] = [
    ...new Map(event.Records.map((item) => [item.body, item])).values(),
  ];
  logger.warn('Unique messages', { uniqueMessages });

  const results = await Promise.allSettled(
    uniqueMessages.map(async (record) => {
      const payload = JSON.parse(record.body);
      try {
        const resultProcessor = await initAppAndExecuteProcessor(
          payload.message,
          payload.data,
        );

        return { status: 'fulfilled', record, result: resultProcessor };
      } catch (error) {
        return { status: 'rejected', record, error };
      }
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    logger.error('some messages failed', { failed });
    throw new InternalServerErrorException({
      message: 'ProcessSQSEvent: some messages failed',
    });
  }

  return results;
}
