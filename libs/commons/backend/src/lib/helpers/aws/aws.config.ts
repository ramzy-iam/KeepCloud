import 'dotenv/config';
import * as z from 'zod/v4';
import { awsSchema } from '../../config';
import { Logger } from '../logger.helper';

const result = awsSchema.safeParse(process.env);

if (!result.success) {
  Logger.error(
    'Invalid environment variables:\n',
    z.prettifyError(result.error),
  );
  process.exit(1);
}

const config = result.data;

export function getAWSConfig() {
  return {
    awsKeyId: config.APP_AWS_ACCESS_KEY_ID,
    awsSecret: config.APP_AWS_SECRET_ACCESS_KEY,
    awsRegion: config.AWS_DEFAULT_REGION,
  };
}
