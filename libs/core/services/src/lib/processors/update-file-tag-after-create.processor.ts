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
    const { ownerId, sourcePath, fileId } = data;
    this.logger.info(`Start moving fileId=${fileId} for ownerId=${ownerId}`);

    try {
      this.logger.info(`Remove status=pending tag on file object`);

      await this.s3helper.putObjectTagging(this.bucket, sourcePath, {
        upload: FileUploadStatus.COMPETED,
      });

      this.logger.info(
        `Successfully removed status tag from file object for fileId=${fileId}`,
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
