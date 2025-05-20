import {
  FileTrashedException,
  FolderTrashedException,
  ParentFolderTrashedException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';
import { FileRepository, File } from '@keepcloud/core/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseFileService {
  constructor(protected readonly fileRepository: FileRepository) {}

  abstract create(dto: unknown): Promise<File>;

  abstract getOne(...args: unknown[]): Promise<unknown>;

  async checkAndThrowIfTrashed(fileId: string): Promise<void> {
    const { trashedBy, isFolder } = await this.fileRepository.isTrashed(fileId);

    if (!trashedBy) {
      // Not trashed at all, just return
      return;
    }

    switch (trashedBy) {
      case 'self':
        if (isFolder) {
          throw new FolderTrashedException();
        } else {
          throw new FileTrashedException();
        }
      case 'parent':
        throw new ParentFolderTrashedException();
    }
  }
}
