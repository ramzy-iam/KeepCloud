import {
  APIGatewayProxyEvent,
  SQSEvent,
  Context,
  Handler,
  Callback,
} from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './bootstrap';
import { processSQSEvent } from './sqs-processor';
import { processDefaultEvent } from './default-processor';

let cachedServer: Handler;

async function bootstrapServer(): Promise<Handler> {
  if (!cachedServer) {
    const app = await createApp();
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

interface DefaultEvent {
  message: string;
  data: unknown;
}
export const handler = async (
  event: APIGatewayProxyEvent & SQSEvent & DefaultEvent,
  context: Context,
  callback: Callback,
) => {
  if ('httpMethod' in event && event.httpMethod) {
    const server = await bootstrapServer();
    return server(event, context, callback);
  }

  if ('Records' in event && event.Records.length > 0) {
    return processSQSEvent(event);
  }

  return processDefaultEvent(event);
};
