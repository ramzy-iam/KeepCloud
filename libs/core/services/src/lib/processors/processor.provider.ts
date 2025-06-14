import { Injectable } from '@nestjs/common';
import { MoveFileInAfterCreateProcessor } from './move-file-after-create.processor';
import { ErrorCode, ProcessorAction } from '@keepcloud/commons/constants';
import { AppException } from '@keepcloud/commons/backend';
import { Processor } from '@keepcloud/commons/types';
import { DeleteNodeProcessor } from './delete-node.processor';
import { DeleteFileFromStorageProcessor } from './delete-file-from-storage.processor';
import { RebuildTreeProcessor } from './rebuild-tree.processor';

@Injectable()
export class ProcessorProvider {
  constructor(
    private readonly moveFileInAfterCreateProcessor: MoveFileInAfterCreateProcessor,
    private readonly deleteNodeProcessor: DeleteNodeProcessor,
    private readonly deleteFileFromStorageProcessor: DeleteFileFromStorageProcessor,
    private readonly rebuildTreeProcessor: RebuildTreeProcessor,
  ) {}

  getFromMessage(message: string): Processor {
    const processorMap = new Map<string, Processor>([
      [
        ProcessorAction.MOVE_FILE_AFTER_CREATE,
        this.moveFileInAfterCreateProcessor,
      ],
      [ProcessorAction.NESTED_SET_DELETE_NODE, this.deleteNodeProcessor],
      [
        ProcessorAction.DELETE_FILE_FROM_STORAGE,
        this.deleteFileFromStorageProcessor,
      ],
      [ProcessorAction.NESTED_SET_REBUILD_TREE, this.rebuildTreeProcessor],
    ]);

    const processor = processorMap.get(message);
    if (!processor)
      throw AppException.create({
        code: ErrorCode.UNKNOWN_PROCESSOR,
        message: `Unknown processor: ${message}`,
        status: 400,
      });

    return processor;
  }
}
