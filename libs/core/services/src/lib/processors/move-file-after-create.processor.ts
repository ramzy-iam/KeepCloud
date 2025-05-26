import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { FileService } from '../file';
import { MoveFileInStorageData, Processor } from '@keepcloud/commons/types';

@Injectable()
export class MoveFileInAfterCreateProcessor
  extends FileService
  implements Processor
{
  private logger = new Logger(MoveFileInAfterCreateProcessor.name);

  async execute(data: MoveFileInStorageData) {
    const { ownerId, sourcePath, fileId, filename } = data;
    this.logger.info(`Start moving fileId=${fileId} for ownerId=${ownerId}`);

    try {
      const destinationPath = this.generateStorageKey(
        ownerId,
        filename,
        fileId,
      );
      this.logger.debug(`Destination path: ${destinationPath}`);

      await this.moveFileInStorage(
        `${this.bucket}/${sourcePath}`,
        destinationPath,
      );
      this.logger.info(`File moved to ${destinationPath}`);

      await this.fileRepository.update(
        { id: fileId },
        { storagePath: destinationPath },
      );
      this.logger.info(`File DB record updated`);

      await this.s3helper.deleteFile(this.bucket, sourcePath);
      this.logger.info(`Source file deleted: ${sourcePath}`);

      this.logger.info(
        `Move operation completed successfully for fileId=${fileId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error moving fileId=${fileId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
