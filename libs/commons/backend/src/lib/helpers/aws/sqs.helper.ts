import {
  DeleteMessageCommand,
  DeleteMessageCommandOutput,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  ReceiveMessageCommandOutput,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';
import AwsServiceHelper from './base.helper';
import { Logger } from '../logger.helper';

export class SQShelper extends AwsServiceHelper<SQSClient> {
  protected client: SQSClient;
  protected static instanceMap = new Map<string, SQShelper>();
  private logger = new Logger(SQShelper.name);

  protected constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
  ) {
    super();
    this.client = new SQSClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });
  }

  public static getInstance(region?: string): SQShelper {
    return super._getInstance(
      SQShelper as unknown as { new (...args: any[]): SQShelper },
      region,
    );
  }

  async sendMessage(
    queueUrl: string,
    MessageBody: string,
  ): Promise<SendMessageCommandOutput | undefined> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody,
      });

      const data = await this.client.send(command);
      this.logger.info(
        `Data Queue Response for send message: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (error) {
      this.logger.error('Failed to send message', error);
      throw error;
    }
  }

  async deleteMessage(
    queueUrl: string,
    ReceiptHandle: string,
  ): Promise<DeleteMessageCommandOutput | undefined> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle,
      });
      const data = await this.client.send(command);
      this.logger.debug(
        `Data Queue Response for delete message: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (error: any) {
      this.logger.error('Failed to delete message', error);
      throw error;
    }
  }

  async receiveMessage(
    queueUrl: string,
  ): Promise<ReceiveMessageCommandOutput | undefined> {
    try {
      const params: ReceiveMessageCommandInput = {
        AttributeNames: ['LastModifiedTimestamp'],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ['All'],
        QueueUrl: queueUrl,
        WaitTimeSeconds: 20,
      };
      const command = new ReceiveMessageCommand(params);
      const data = await this.client.send(command);
      this.logger.debug(
        `Data Queue Response for receive message: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (error: any) {
      this.logger.error('Failed to receive message', error);
      throw error;
    }
  }
}
