import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { Processor, RebuildTreeData } from '@keepcloud/commons/types';
import { NestedSetService } from '../storage';

@Injectable()
export class RebuildTreeProcessor implements Processor {
  protected readonly logger = new Logger(RebuildTreeProcessor.name);

  constructor(private readonly nestedSetService: NestedSetService) {}

  async execute(data: RebuildTreeData) {
    const { userId } = data;
    this.logger.info(`Start rebuilding nested set tree for userId=${userId}`);

    try {
      await this.nestedSetService.rebuildTree(userId);
      this.logger.info(
        `Successfully rebuilt nested set tree for userId=${userId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to rebuild nested set tree for userId=${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
