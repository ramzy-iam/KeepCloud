import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { DeleteNodeData, Processor } from '@keepcloud/commons/types';
import { NestedSetService } from '../storage';

@Injectable()
export class DeleteNodeProcessor implements Processor {
  protected readonly logger = new Logger(DeleteNodeProcessor.name);

  constructor(private readonly nestedSetService: NestedSetService) {}

  async execute(data: DeleteNodeData) {
    const { ownerId, nodeId } = data;

    this.logger.info(`Start deleting nodeId=${nodeId} for ownerId=${ownerId}`);

    try {
      await this.nestedSetService.deleteNode(nodeId, ownerId);
      // 1. Delete node and subtree in DB (mark deletedAt, update nested set)

      this.logger.info(`Node ${nodeId} deleted successfully`);
    } catch (error: any) {
      this.logger.error(
        `Error deleting nodeId=${nodeId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
