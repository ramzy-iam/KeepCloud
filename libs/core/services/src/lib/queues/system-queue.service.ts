import { Injectable } from '@nestjs/common';
import { AbstractQueueService } from './queue.service';
import {
  APP_LOCAL_QUEUES,
  ProcessorAction,
} from '@keepcloud/commons/constants';
import {
  UpdateFileTagInStorageData,
  DeleteNodeData,
  DeleteFileFromStorageData,
  DeleteFileAndChildrenFromStorageData,
} from '@keepcloud/commons/types';
import { Env } from '@keepcloud/commons/backend';
import { SendEmailOptions } from '../notifications';

@Injectable()
export class SystemQueueService extends AbstractQueueService {
  protected readonly queueName = APP_LOCAL_QUEUES.system.name;
  protected readonly jobName = APP_LOCAL_QUEUES.system.jobName;
  protected readonly queueUrl = Env.SYSTEM_QUEUE_URL;

  enqueueUpdateFileTagInStorage(data: UpdateFileTagInStorageData) {
    return this.sendJob({
      message: ProcessorAction.UPDATE_FILE_TAG_IN_STORAGE,
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

  enqueueDeleteFileAndChildrenFromStorage(
    data: DeleteFileAndChildrenFromStorageData,
  ) {
    return this.sendJob({
      message: ProcessorAction.DELETE_FILE_AND_CHILDREN_FROM_STORAGE,
      data,
    });
  }

  enqueueSendEmail(data: SendEmailOptions) {
    return this.sendJob({
      message: ProcessorAction.SEND_EMAIL_NOTIFICATION,
      data,
    });
  }
}
