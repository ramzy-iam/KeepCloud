import { initAppAndExecuteProcessor } from './bootstrap';
import {
  InternalServerErrorException,
  Logger,
} from '@keepcloud/commons/backend';

export async function processDefaultEvent(event: {
  message: string;
  data: unknown;
}) {
  const { message, data } = event;
  const logger = new Logger('DefaultProcessor');
  logger.debug('Start lambda invocation ==> ', message);
  try {
    return await initAppAndExecuteProcessor(message, data);
  } catch (error) {
    logger.error('Failed to invoke lambda ==> ', { message, error });
    throw new InternalServerErrorException(
      undefined,
      'ProcessEvent: some messages failed',
    );
  }
}
