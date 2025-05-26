import { Logger } from '@keepcloud/commons/backend';
import { APP_LOCAL_QUEUES } from '@keepcloud/commons/constants';
import { Injectable } from '@nestjs/common';
import { QueueWorkerService } from './worker.service';
import { PrismaService } from '@keepcloud/core/db';
import { ProcessorProvider } from '../processors';

@Injectable()
export class SystemQueueWorkerService extends QueueWorkerService {
  protected logger = new Logger(SystemQueueWorkerService.name);
  protected queueName = APP_LOCAL_QUEUES.system.name;

  constructor(
    protected override processorProvider: ProcessorProvider,
    protected override prismaService: PrismaService,
  ) {
    super(processorProvider, prismaService);
  }
}
