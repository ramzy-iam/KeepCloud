import { SQShelper } from '@keepcloud/commons/backend';
import { ProcessorAction } from '@keepcloud/commons/constants';
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
        connection: { url: process.env.SYSTEM_QUEUE_URL },
      });
    }
    return this._bullQueue;
  }

  protected isLocal(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  async sendJob<T>(payload: {
    message: ProcessorAction;
    data: T;
  }): Promise<void> {
    if (this.isLocal()) {
      await this.bullQueue.add(this.jobName, payload);
    } else {
      await this.sqsHelper.sendMessage({
        queueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
        MessageGroupId: this.jobName, // Use jobName as group ID for FIFO queues
      });
    }
  }
}
