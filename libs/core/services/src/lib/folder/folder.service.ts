import { Injectable } from '@nestjs/common';
import { File, FileType } from '@keepcloud/core/db';
import {
  CreateFolderDto,
  FileAncestorDto,
  FolderFilterDto,
  PaginationDto,
} from '@keepcloud/commons/dtos';
import {
  BadRequestException,
  FolderNotFoundException,
} from '@keepcloud/commons/backend';
import { ErrorCode, SYSTEM_FILE } from '@keepcloud/commons/constants';
import { Prisma } from '@prisma/client';
import { BaseFileService } from '../file/base-file-service';

@Injectable()
export class FolderService extends BaseFileService {
  async create(dto: CreateFolderDto): Promise<File> {
    if (dto.parentId) {
      const parent = await this.fileRepository.scoped
        .filterById(dto.parentId)
        .filerByIsFolder()
        .getOne();

      if (!parent) {
        throw new BadRequestException({
          code: ErrorCode.PARENT_FOLDER_NOT_FOUND,
          message: 'Parent must be a valid folder',
          field: 'parentId',
        });
      }
    }

    const folderData: Prisma.FileCreateInput = {
      name: dto.name,
      owner: { connect: { id: dto.ownerId } },
      contentType: 'folder',
      isFolder: true,
      size: BigInt(0),
      type: FileType.FOLDER,
      storagePath: null,
      isSystem: false,
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      children: { connect: [] },
    };

    return this.fileRepository.create(folderData);
  }

  async getChildren(
    parentId: string,
    filters: FolderFilterDto,
  ): Promise<PaginationDto<File>> {
    const scope = this.fileRepository.scoped
      .filterByParentId(parentId)
      .filterByNotTrashed()
      .joinOwner();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return scope.getManyPaginated(filters.page, filters.pageSize);
  }

  async getOne(
    id: string,
    withAncestors = false,
  ): Promise<{ file: File; ancestors: FileAncestorDto[] }> {
    const file = await this.fileRepository.scoped
      .filterById(id)
      .filterByType(FileType.FOLDER)
      .joinOwner()
      .getOne();

    if (!file) throw new FolderNotFoundException(id);

    await this.checkAndThrowIfTrashed(id);

    let ancestors: FileAncestorDto[] = [];
    if (typeof withAncestors === 'boolean' && withAncestors) {
      ancestors = await this.fileRepository.getAncestors(id);
    }
    return {
      file,
      ancestors: [
        {
          id: SYSTEM_FILE.MY_STORAGE.id,
          name: SYSTEM_FILE.MY_STORAGE.name,
          code: SYSTEM_FILE.MY_STORAGE.code,
          isSystem: true,
        },
        ...ancestors,
      ],
    };
  }
}
