import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { DeleteNodeData, Processor } from '@keepcloud/commons/types';
import { NestedSetService } from '../storage';

@Injectable()
export class DeleteNodeProcessor implements Processor {
  protected readonly logger = new Logger(DeleteNodeProcessor.name);

  constructor(private readonly nestedSetService: NestedSetService) {}

  async execute(data: DeleteNodeData) {
    const { treeOwnerId, nodeId } = data;

    this.logger.info(
      `Start deleting nodeId=${nodeId} for treeOwnerId=${treeOwnerId}`,
    );

    try {
      await this.nestedSetService.deleteNode(treeOwnerId, nodeId);
      // 1. Delete node and subtree in DB (mark deletedAt, update nested set)

      this.logger.info(`Node ${nodeId} deleted successfully`);
    } catch (error: unknown) {
      this.logger.error(
        `Error deleting nodeId=${nodeId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
