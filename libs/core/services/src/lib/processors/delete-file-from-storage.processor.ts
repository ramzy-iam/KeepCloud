import { Env, Logger, S3Helper } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { DeleteFileFromStorageData, Processor } from '@keepcloud/commons/types';

@Injectable()
export class DeleteFileFromStorageProcessor implements Processor {
  protected readonly logger = new Logger(DeleteFileFromStorageProcessor.name);
  private readonly s3helper: S3Helper;
  private readonly bucket: string;
  constructor() {
    this.s3helper = S3Helper.getInstance();
    this.bucket = Env.FILE_BUCKET;
  }

  async execute(data: DeleteFileFromStorageData) {
    const { treeOwnerId, fileId, storagePath } = data;
    this.logger.info(
      `Deleting file for treeOwnerId=${treeOwnerId}, fileId=${fileId}, key=${storagePath}`,
    );

    try {
      this.s3helper.deleteFile(this.bucket, storagePath);

      this.logger.info(
        `Successfully deleted file ${storagePath} for fileId=${fileId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to delete file ${storagePath} for fileId=${fileId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
