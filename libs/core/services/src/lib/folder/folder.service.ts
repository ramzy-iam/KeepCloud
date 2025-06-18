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
    let parentId = dto.parentId;
    if (!parentId) {
      const root = await this.fileRepository.getRootFolder();
      parentId = root.id;

      const parent = await this.fileRepository.scoped
        .filterById(parentId)
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

    const createdFolder = await this.fileRepository.prisma.$transaction(
      async (tx) => {
        const { left, right } =
          await this.nestedSetService.allocateNestedSetPosition(parentId, tx);

        const folderData: Prisma.FileCreateInput = {
          name: dto.name,
          owner: { connect: { id: dto.ownerId } },
          createdBy: { connect: { id: dto.ownerId } },
          contentType: 'folder',
          isFolder: true,
          size: BigInt(0),
          type: FileType.FOLDER,
          storagePath: null,
          isSystem: false,
          left,
          right,
          parent: { connect: { id: parentId } },
          children: { connect: [] },
        };

        const folder = await tx.file.create({ data: folderData });
        return folder;
      },
    );

    const { file } = await this.getOne(createdFolder.id);
    return file;
  }
  async getChildren(
    parentId: string,
    filters: FolderFilterDto,
  ): Promise<PaginationDto<File>> {
    const scope = this.fileRepository.scoped
      .filterByParentId(parentId)
      .filterByNotTrashed()
      .orderBy({ isFolder: 'desc', name: filters.order })
      .joinOwner();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return scope.getManyPaginated(filters.page, filters.pageSize);
  }

  async getOne(
    id: string,
    withAncestors = false,
  ): Promise<{ file: File; ancestors?: FileAncestorDto[] }> {
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
