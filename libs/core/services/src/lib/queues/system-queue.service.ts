import { Injectable } from '@nestjs/common';
import { AbstractQueueService } from './queue.service';
import {
  APP_LOCAL_QUEUES,
  ProcessorAction,
} from '@keepcloud/commons/constants';
import {
  MoveFileInStorageData,
  DeleteNodeData,
  DeleteFileFromStorageData,
} from '@keepcloud/commons/types';

@Injectable()
export class SystemQueueService extends AbstractQueueService {
  protected readonly queueName = APP_LOCAL_QUEUES.system.name;
  protected readonly jobName = APP_LOCAL_QUEUES.system.jobName;
  protected readonly queueUrl = process.env.SYSTEM_QUEUE_URL;

  enqueueMoveFileInStorageAfterCreate(data: MoveFileInStorageData) {
    return this.sendJob({
      message: ProcessorAction.MOVE_FILE_AFTER_CREATE,
      data,
    });
  }

  enqueueNestedSetDeleteNode(data: DeleteNodeData) {
    return this.sendJob({
      message: ProcessorAction.NESTED_SET_DELETE_NODE,
      data,
    });
  }

  enqueueNestedSetRebuildTree(userId: string) {
    return this.sendJob({
      message: ProcessorAction.NESTED_SET_REBUILD_TREE,
      data: {
        userId,
      },
    });
  }

  enqueueDeleteFileFromStorage(data: DeleteFileFromStorageData) {
    return this.sendJob({
      message: ProcessorAction.DELETE_FILE_FROM_STORAGE,
      data,
    });
  }
}
