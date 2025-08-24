import { Env, Logger } from '@keepcloud/commons/backend';
import { APP_LOCAL_QUEUES } from '@keepcloud/commons/constants';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import { ProcessorProvider } from '../processors';
import { PrismaService } from '@keepcloud/core/db';

export abstract class QueueWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  protected worker: Worker | null = null;
  protected abstract logger: Logger;
  protected abstract queueName: string;
  protected connection: ConnectionOptions = {
    url: Env.SYSTEM_QUEUE_URL,
  };

  constructor(
    protected processorProvider: ProcessorProvider,
    protected prismaService: PrismaService,
  ) {}

  protected isLocal(): boolean {
    return Env.NODE_ENV !== 'production';
  }

  onModuleInit() {
    if (!this.isLocal()) {
      this.logger.debug('Skipping queue worker initialization in production.');
      return;
    }

    this.logger.debug(
      `Initializing local queue worker for "${this.queueName}"`,
    );

    this.worker = new Worker(
      this.queueName,
      async (job: Job<{ message: string; data: unknown }>) => {
        this.logger.info(
          `Processing job ${job.id} of type ${job.data.message}`,
        );
        this.logger.info('Payload:', job.data);

        if (job.name !== APP_LOCAL_QUEUES.system.jobName) {
          this.logger.info(`Job ${job.id} is not a system job, skipping...`);
          return;
        }

        const { data, message } = job.data;
        const processor = this.processorProvider.getFromMessage(message);
        await processor.execute(data);
      },
      {
        connection: this.connection,
        removeOnComplete: { count: 10, age: 30 * 60 },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.info(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed with error:`, err);
    });
  }

  async onModuleDestroy() {
    if (this.worker) {
      this.logger.debug('Closing local queue worker...');
      await this.worker.close();
    }
  }
}
