import { Injectable } from '@nestjs/common';
import {
  File,
  FileType,
  FilePermissionRole,
  FileRepository,
} from '@keepcloud/core/db';
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
import { FilePermissionService } from '../file';
import { NestedSetService } from '../storage';

@Injectable()
export class FolderService {
  constructor(
    protected readonly fileRepository: FileRepository,
    protected readonly nestedSetService: NestedSetService,
    protected readonly filePermissionService: FilePermissionService,
  ) {}
  async create(dto: CreateFolderDto): Promise<File> {
    let parentId = dto.parentId;
    let parent: File | null = null;
    if (!parentId) {
      const root = await this.fileRepository.getRootFolder(dto.ownerId);
      parentId = root.id;
    }

    // Verify user has EDITOR role or higher on the parent folder
    await this.filePermissionService.verifyUserRole(
      parentId,
      dto.ownerId,
      FilePermissionRole.EDITOR,
    );

    parent = await this.fileRepository.scoped
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

    const treeOwnerId = parent?.treeOwnerId as string;

    const createdFolder = await this.fileRepository.prisma.$transaction(
      async (tx) => {
        const { left, right } =
          await this.nestedSetService.allocateNestedSetPosition(
            treeOwnerId,
            parentId,
            tx,
          );

        const folderData: Prisma.FileCreateInput = {
          name: dto.name,
          owner: { connect: { id: dto.ownerId } },
          treeOwner: { connect: { id: treeOwnerId } },
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

    // Create inherited permission for tree owner if folder is created in a shared folder
    await this.filePermissionService.createInheritedPermissionForTreeOwner(
      createdFolder.id,
      dto.ownerId,
    );

    const { file } = await this.getOne(dto.ownerId, createdFolder.id);
    return file;
  }
  async getChildren(
    userId: string,
    parentId: string,
    filters: FolderFilterDto,
  ): Promise<PaginationDto<File>> {
    // First, verify user has access to the parent folder (including ancestor permissions)
    await this.getOne(userId, parentId);

    const scope = this.fileRepository.scoped
      .filterByParentId(parentId)
      .filterByNotTrashed()
      .orderBy([{ isFolder: 'desc' }, { name: filters.order }])
      .joinOwner()
      .joinPermissions();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return scope.getManyPaginated(filters.page, filters.pageSize);
  }

  async getOne(
    userId: string,
    id: string,
    withAncestors = false,
  ): Promise<{ file: File; ancestors?: FileAncestorDto[] }> {
    // First check if user has access through direct permissions or ancestor permissions
    const hasAccess = await this.fileRepository.hasAncestorAccess(id, userId);

    if (!hasAccess) {
      throw new FolderNotFoundException(id);
    }

    const scope = this.fileRepository.scoped
      .filterById(id)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .joinOwner()
      .joinPermissions();

    const file = await scope.getOne();
    if (!file) throw new FolderNotFoundException(id);

    // Check if this folder is shared with the user (not owned by them)
    const isSharedWithUser = file.treeOwnerId !== userId;

    let ancestors: FileAncestorDto[] = [];
    if (typeof withAncestors === 'boolean' && withAncestors) {
      ancestors = await this.fileRepository.getAncestors(id);
    }
    return {
      file,
      ancestors: [
        {
          id: isSharedWithUser
            ? SYSTEM_FILE.SHARED_WITH_ME.id
            : SYSTEM_FILE.MY_STORAGE.id,
          name: isSharedWithUser
            ? SYSTEM_FILE.SHARED_WITH_ME.name
            : SYSTEM_FILE.MY_STORAGE.name,
          code: isSharedWithUser
            ? SYSTEM_FILE.SHARED_WITH_ME.code
            : SYSTEM_FILE.MY_STORAGE.code,
          isSystem: true,
        },
        ...ancestors,
      ],
    };
  }
}
