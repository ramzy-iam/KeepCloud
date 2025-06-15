import { Logger, S3Helper } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { DeleteFileFromStorageData, Processor } from '@keepcloud/commons/types';

@Injectable()
export class DeleteFileFromStorageProcessor implements Processor {
  protected readonly logger = new Logger(DeleteFileFromStorageProcessor.name);
  private readonly s3helper: S3Helper;
  private readonly bucket: string;
  constructor() {
    this.s3helper = S3Helper.getInstance();
    this.bucket = process.env.FILE_BUCKET;
  }

  async execute(data: DeleteFileFromStorageData) {
    const { ownerId, fileId, storagePath } = data;
    this.logger.info(
      `Deleting file for ownerId=${ownerId}, fileId=${fileId}, key=${storagePath}`,
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
