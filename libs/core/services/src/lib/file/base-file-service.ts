import {
  FileTrashedException,
  FolderTrashedException,
  ParentFolderTrashedException,
} from '@keepcloud/commons/backend';
import { FileRepository, File, Prisma } from '@keepcloud/core/db';
import { Injectable } from '@nestjs/common';
import { NestedSetService } from '../storage';

@Injectable()
export abstract class BaseFileService {
  constructor(
    protected readonly fileRepository: FileRepository,

    protected readonly nestedSetService: NestedSetService,
  ) {}

  abstract create(...dto: unknown[]): Promise<File>;

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
