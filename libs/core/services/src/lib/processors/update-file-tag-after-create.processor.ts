import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { FileService } from '../file';
import {
  UpdateFileTagInStorageData,
  Processor,
} from '@keepcloud/commons/types';
import { FileUploadStatus } from '@keepcloud/commons/constants';

@Injectable()
export class UpdateFileTagInAfterCreateProcessor
  extends FileService
  implements Processor
{
  protected override logger = new Logger(
    UpdateFileTagInAfterCreateProcessor.name,
  );

  async execute(data: UpdateFileTagInStorageData) {
    const { treeOwnerId, sourcePath, fileId } = data;
    this.logger.info(
      `Start changing the upload tag fileId=${fileId} for treeOwnerId=${treeOwnerId}`,
    );

    try {
      this.logger.info(`Remove upload=pending tag on file object`);

      await this.s3helper.putObjectTagging(this.bucket, sourcePath, {
        upload: FileUploadStatus.COMPETED,
      });

      this.logger.info(
        `Successfully removed upload tag from file object for fileId=${fileId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error remove status tag from file object for fileId=${fileId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
