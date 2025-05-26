import { Logger } from '@keepcloud/commons/backend';
import { APP_LOCAL_QUEUES } from '@keepcloud/commons/constants';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ProcessorProvider } from '../processors';
import { PrismaService, RLSContextService } from '@keepcloud/core/db';

export abstract class QueueWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  protected worker: Worker;
  protected abstract logger: Logger;
  protected abstract queueName: string;
  protected connection = { host: 'localhost', port: 6379 };

  constructor(
    protected processorProvider: ProcessorProvider,
    protected prismaService: PrismaService,
  ) {}

  onModuleInit() {
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

        RLSContextService.runWithContext(
          { prisma: this.prismaService.getClient() },
          async () => {
            const { data, message } = job.data;

            const processor = this.processorProvider.getFromMessage(message);
            await processor.execute(data);
          },
        );
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
    this.logger.debug('Closing system queue worker...');
    await this.worker.close();
  }
}
