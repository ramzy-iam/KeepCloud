import { SQSEvent, SQSRecord } from 'aws-lambda';
import { initAppAndExecuteProcessor } from './init-processor';
import {
  InternalServerErrorException,
  Logger,
  SQShelper,
} from '@keepcloud/commons/backend';

export async function processSQSEvent(event: SQSEvent) {
  const logger = new Logger('SQSProcessor');
  const sQShelper = SQShelper.getInstance();
  const errors = [];
  const uniqueMessages: SQSRecord[] = [
    ...new Map(event.Records.map((item) => [item.body, item])).values(),
  ];

  const results = await Promise.allSettled(
    uniqueMessages.map(async (record: SQSRecord) => {
      const message = JSON.parse(record.body);
      try {
        const resultProcessor = await initAppAndExecuteProcessor(
          message.messageType,
          message.data,
        );

        sQShelper.deleteMessage(
          process.env.SQS_SYSTEM_QUEUE_URL,
          record.receiptHandle,
        );
        return resultProcessor;
      } catch (error) {
        errors.push({ message: record.body, error });
      }
    }),
  );

  if (errors.length > 0) {
    logger.error('ProcessSQSEvent: some messages failed', { errors });
    throw new InternalServerErrorException({
      message: 'ProcessSQSEvent: some messages failed',
    });
  }

  return results;
}
