import { Env, Logger, S3Helper } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import {
  DeleteFileAndChildrenFromStorageData,
  Processor,
} from '@keepcloud/commons/types';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DeleteFileAndChildrenFromStorageProcessor implements Processor {
  protected readonly logger = new Logger(
    DeleteFileAndChildrenFromStorageProcessor.name,
  );
  private readonly s3helper: S3Helper;
  private readonly bucket: string;

  constructor(private readonly storageService: StorageService) {
    this.s3helper = S3Helper.getInstance();
    this.bucket = Env.FILE_BUCKET;
  }

  async execute(data: DeleteFileAndChildrenFromStorageData) {
    const { ownerId, fileId } = data;

    this.logger.info(
      `Fetching and deleting files for ownerId=${ownerId}, fileId=${fileId}`,
    );

    try {
      // Fetch all files under this node (including the node itself)
      const filesToDelete = await this.storageService.getFilesUnderNode(
        ownerId,
        fileId,
      );

      if (filesToDelete.length === 0) {
        this.logger.info(
          `No files found to delete for fileId=${fileId}, ownerId=${ownerId}`,
        );
        return;
      }

      this.logger.info(
        `Found ${filesToDelete.length} files to delete for fileId=${fileId}`,
      );

      // Filter files that have storage paths (actual files, not just folders)
      const filesWithStorage = filesToDelete.filter(
        (file) => file.storagePath && file.storagePath.trim() !== '',
      );

      if (filesWithStorage.length === 0) {
        this.logger.info(
          `No files with storage paths found for fileId=${fileId}`,
        );
        return;
      }

      this.logger.info(
        `Deleting ${filesWithStorage.length} files from S3 storage`,
      );

      // Split into chunks of 1000 (S3 limit for batch delete)
      const chunks = this.chunkArray(filesWithStorage, 1000);

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const keys = chunk.map((file) => file.storagePath as string);

        this.logger.info(
          `Processing chunk ${chunkIndex + 1}/${chunks.length} with ${keys.length} files`,
        );

        const result = await this.s3helper.deleteMultipleFiles(
          this.bucket,
          keys,
        );

        // Log successful deletions
        if (result.successfulDeletes.length > 0) {
          this.logger.info(
            `Successfully deleted ${result.successfulDeletes.length} files from chunk ${chunkIndex + 1}`,
          );
        }

        // Log and handle errors
        if (result.errors.length > 0) {
          this.logger.error(
            `Failed to delete ${result.errors.length} files from chunk ${chunkIndex + 1}`,
            { errors: result.errors },
          );

          // For now, we'll just log the errors but not throw to avoid failing the entire batch
        }
      }

      this.logger.info(
        `Delete operation completed for ownerId=${ownerId}, fileId=${fileId}, processed ${filesWithStorage.length} files`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to delete files and children for fileId=${fileId}, ownerId=${ownerId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
