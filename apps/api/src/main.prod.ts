import { APIGatewayProxyEvent, SQSEvent, Context } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { createApp } from './bootstrap';
import { processSQSEvent } from './sqs-processor';
import { processDefaultEvent } from './default-processor';

let cachedServer: Server;

export async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const app = await createApp();
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = createServer(expressApp);
  }
  return cachedServer;
}

export function proxyServer(
  server: Server,
  event: APIGatewayProxyEvent,
  context: Context,
) {
  return proxy(server, event, context, 'PROMISE').promise;
}

interface DefaultEvent {
  message: string;
  data: unknown;
}
export const handler = async (
  event: APIGatewayProxyEvent & SQSEvent & DefaultEvent,
  context: Context,
) => {
  if ('httpMethod' in event && event.httpMethod) {
    const server = await bootstrapServer();
    return proxyServer(server, event, context);
  }

  if ('Records' in event && event.Records.length > 0) {
    return processSQSEvent(event);
  }

  return processDefaultEvent(event);
};
