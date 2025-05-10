import { Injectable } from '@nestjs/common';
import { File, FileType } from '@keepcloud/core/db';
import {
  CreateFolderDto,
  FolderFilterDto,
  PaginationDto,
} from '@keepcloud/commons/dtos';
import {
  BadRequestException,
  NotFoundException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';
import { Prisma } from '@prisma/client';
import { BaseFileService } from '../file/base-file-service';

@Injectable()
export class FolderService extends BaseFileService {
  async create(dto: CreateFolderDto): Promise<File> {
    if (dto.parentId) {
      const parent = await this.fileRepository.findOne({ id: dto.parentId });
      if (!parent || parent.type !== FileType.FOLDER) {
        throw new BadRequestException(
          ErrorCode.INVALID_PARENT_FOLDER,
          'Parent must be a valid folder',
          'parentId',
        );
      }
    }

    const existingFolder = await this.fileRepository.findOne({
      name: dto.name,
      parentId: dto.parentId,
    });
    if (existingFolder) {
      throw new BadRequestException(
        ErrorCode.FOLDER_ALREADY_EXISTS,
        `A folder named "${dto.name}" already exists in this folder`,
        'name',
      );
    }

    const folderData: Prisma.FileCreateInput = {
      name: dto.name,
      owner: { connect: { id: dto.ownerId } },
      contentType: 'folder',
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
    const scope = this.fileRepository.scoped.filterByParentId(parentId);

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return this.fileRepository.findManyPaginated(
      scope.where,
      filters.page,
      filters.pageSize,
    );
  }

  override async getOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      id,
      type: FileType.FOLDER,
    });
    if (!file)
      throw new NotFoundException(ErrorCode.NOT_FOUND, 'Resource not found');
    return file;
  }
}
