import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { MoveNodeData, Processor } from '@keepcloud/commons/types';
import { NestedSetService } from '../storage';

@Injectable()
export class MoveNodeProcessor implements Processor {
  protected readonly logger = new Logger(MoveNodeProcessor.name);

  constructor(private readonly nestedSetService: NestedSetService) {}

  async execute(data: MoveNodeData) {
    const { treeOwnerId, nodeId, newParentId } = data;

    this.logger.info(
      `Start moving nodeId=${nodeId} for treeOwnerId=${treeOwnerId} to newParentId=${newParentId}`,
    );

    try {
      await this.nestedSetService.moveNode(treeOwnerId, nodeId, newParentId);
      this.logger.info(`Node ${nodeId} moved successfully to ${newParentId}`);
    } catch (error: any) {
      this.logger.error(
        `Error moving nodeId=${nodeId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
