import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SQShelper } from '@keepcloud/commons/backend';
import { Queue } from 'bullmq';

export abstract class AbstractQueueService {
  protected abstract readonly queueName: string;
  protected abstract readonly queueUrl: string;
  protected abstract readonly jobName: string;
  private sqsHelper = SQShelper.getInstance();

  // Lazy-loaded BullMQ queue instance
  private _bullQueue?: Queue;

  private get bullQueue(): Queue {
    if (!this._bullQueue) {
      this._bullQueue = new Queue(this.queueName, {
        connection: { host: 'localhost', port: 6379 },
      });
    }
    return this._bullQueue;
  }

  protected isCloud(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  async sendJob<T>(payload: { message: string; data: T }): Promise<void> {
    if (this.isCloud()) {
      await this.sqsHelper.sendMessage(this.queueUrl, JSON.stringify(payload));
    } else {
      await this.bullQueue.add(this.jobName, payload);
    }
  }
}
