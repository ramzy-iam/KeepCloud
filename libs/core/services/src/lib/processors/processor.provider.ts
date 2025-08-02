import { Injectable } from '@nestjs/common';
import { UpdateFileTagInAfterCreateProcessor } from './update-file-tag-after-create.processor';
import { ErrorCode, ProcessorAction } from '@keepcloud/commons/constants';
import { AppException } from '@keepcloud/commons/backend';
import { Processor } from '@keepcloud/commons/types';
import { DeleteNodeProcessor } from './delete-node.processor';
import { DeleteFileFromStorageProcessor } from './delete-file-from-storage.processor';
import { RebuildTreeProcessor } from './rebuild-tree.processor';
import { DeleteFileAndChildrenFromStorageProcessor } from './delete-file-and-children-from-storage.processor';

@Injectable()
export class ProcessorProvider {
  constructor(
    private readonly updateFileTagInAfterCreateProcessor: UpdateFileTagInAfterCreateProcessor,
    private readonly deleteNodeProcessor: DeleteNodeProcessor,
    private readonly deleteFileFromStorageProcessor: DeleteFileFromStorageProcessor,
    private readonly rebuildTreeProcessor: RebuildTreeProcessor,
    private readonly deleteFileAndChildrenFromStorageProcessor: DeleteFileAndChildrenFromStorageProcessor,
  ) {}

  getFromMessage(message: string): Processor {
    const processorMap = new Map<string, Processor>([
      [
        ProcessorAction.UPDATE_FILE_TAG_IN_STORAGE,
        this.updateFileTagInAfterCreateProcessor,
      ],
      [ProcessorAction.NESTED_SET_DELETE_NODE, this.deleteNodeProcessor],
      [
        ProcessorAction.DELETE_FILE_FROM_STORAGE,
        this.deleteFileFromStorageProcessor,
      ],
      [ProcessorAction.NESTED_SET_REBUILD_TREE, this.rebuildTreeProcessor],
      [
        ProcessorAction.DELETE_FILE_AND_CHILDREN_FROM_STORAGE,
        this.deleteFileAndChildrenFromStorageProcessor,
      ],
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
