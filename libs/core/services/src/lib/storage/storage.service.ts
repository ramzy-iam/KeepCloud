import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  File,
  FilePermissionRole,
  FileRepository,
  FileType,
} from '@keepcloud/core/db';
import { PaginationDto, FolderFilterDto } from '@keepcloud/commons/dtos';
import { ErrorCode, SYSTEM_FILE } from '@keepcloud/commons/constants';
import {
  FileNotFoundException,
  FileTrashedException,
  FolderNotFoundException,
  FolderTrashedException,
  NotFoundException,
  ParentFolderTrashedException,
} from '@keepcloud/commons/backend';
import { FilePermissionService } from '../file';
import { NestedSetService } from './nested-set.service';
import { SystemQueueService } from '../queues';
import { UserService } from '../user';

@Injectable()
export class StorageService {
  constructor(
    protected readonly fileRepository: FileRepository,
    protected readonly nestedSetService: NestedSetService,
    @Inject(forwardRef(() => FilePermissionService))
    protected readonly filePermissionService: FilePermissionService,
    protected readonly queueService: SystemQueueService,
    protected readonly userService: UserService,
  ) {}

  async getRootItems(
    userId: string,
    filters: FolderFilterDto,
  ): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder(userId);
    const scope = this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByNotTrashed()
      .orderBy({ isFolder: 'desc' }) //folder first
      .orderBy({ name: filters.order })
      .filterByTreeOwnerId(userId)
      .filterByOwnerId(userId)
      .joinOwner();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return scope.getManyPaginated(filters.page, filters.pageSize);
  }

  async getSharedWithMe(userId: string, filters: FolderFilterDto) {
    const fileIds = await this.fileRepository.prisma.filePermission.findMany({
      where: {
        userId,
        isInherited: false,
        file: { trashedAt: null, deletedAt: null },
      },
      select: { fileId: true },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    });

    const scope = this.fileRepository.scoped
      .filterByIds(fileIds.map((f) => f.fileId))
      .orderBy({ isFolder: 'desc' })
      .orderBy({ name: filters.order })
      .joinOwner();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    const sharedFiles = await scope.getManyPaginated(
      filters.page,
      filters.pageSize,
    );
    const items = sharedFiles.items.map(async (item) => {
      return {
        ...item,
        ancestors: [
          {
            id: SYSTEM_FILE.SHARED_WITH_ME.id,
            name: SYSTEM_FILE.SHARED_WITH_ME.name,
            code: SYSTEM_FILE.SHARED_WITH_ME.code,
            isSystem: true,
          },
        ],
      };
    });

    return {
      ...sharedFiles,
      items: await Promise.all(items),
    };
  }

  async getTrashedItems(userId: string, filters: FolderFilterDto) {
    // Get trashed items that are top-level (their parent is not trashed) and belong to current user

    const trashedFiles = await this.fileRepository.findManyPaginated(
      filters.page,
      filters.pageSize,
      {
        where: {
          treeOwnerId: userId, // Filter by current user
          trashedAt: { not: null },
          deletedAt: null,
          OR: [
            {
              parent: {
                trashedAt: null,
              },
            },
            {
              parentId: null,
            },
          ],
        },
        include: {
          owner: true,
        },
        orderBy: [
          { isFolder: 'desc' }, // folders first
          { name: filters.order },
        ],
      },
    );

    const items = trashedFiles.items.map(async (item) => {
      const ancestors = await this.fileRepository.getAncestors(item.id);
      return {
        ...item,
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
    });

    return {
      ...trashedFiles,
      items: await Promise.all(items),
    };
  }

  async getSuggestedFolders(userId: string): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder(userId);

    return this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByTreeOwnerId(userId)
      .filterByOwnerId(userId)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .joinOwner()
      .joinPermissions()
      .orderBy({ name: 'asc' })
      .getManyPaginated(1, 15);
  }

  async getSuggestedFiles(userId: string): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder(userId);

    return this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByTreeOwnerId(userId)
      .filterByOwnerId(userId)
      .filterByType(FileType.FILE)
      .filterByNotTrashed()
      .joinOwner()
      .joinPermissions()
      .orderBy({ name: 'asc' })
      .getManyPaginated(1, 15);
  }

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

  async rename(userId: string, fileId: string, newName: string): Promise<File> {
    await this.filePermissionService.verifyUserRole(
      fileId,
      userId,
      FilePermissionRole.EDITOR,
    );

    await this.checkAndThrowIfTrashed(fileId);

    return this.fileRepository.update({ id: fileId }, { name: newName });
  }

  async moveToTrash(userId: string, fileId: string): Promise<File> {
    await this.filePermissionService.verifyUserRole(
      fileId,
      userId,
      FilePermissionRole.EDITOR,
    );

    const resource = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(userId)
      .filterByIsSystem(false)
      .getOneOrFail();

    if (resource.trashedAt) {
      if (this.fileRepository.isFolder(resource))
        throw new FolderNotFoundException(fileId);
      throw new FileNotFoundException(fileId);
    }

    const trashedAt = new Date();
    const file = await this.fileRepository.update(
      { id: fileId },
      { trashedAt },
    );

    // Mark all files under this node as trashed (cascade)
    if (this.fileRepository.isFolder(file)) {
      await this.fileRepository.prisma.file.updateMany({
        where: {
          left: { gt: file.left },
          right: { lt: file.right },
        },
        data: { trashedAt },
      });
    }

    return file;
  }

  async restore(userId: string, fileId: string): Promise<File> {
    await this.filePermissionService.verifyUserRole(
      fileId,
      userId,
      FilePermissionRole.EDITOR,
    );

    const scope = this.fileRepository.scoped
      .filterById(fileId)
      .filterByIsSystem(false)
      .filterByOwnerId(userId);

    const resource = await scope.getOneOrFail();
    if (!resource.trashedAt) {
      throw new FileNotFoundException(fileId);
    }

    const restored = await this.fileRepository.update(
      { id: fileId },
      { trashedAt: null },
    );

    await this.fileRepository.prisma.file.updateMany({
      where: {
        treeOwnerId: restored.treeOwnerId,
        left: { gt: restored.left },
        right: { lt: restored.right },
      },
      data: { trashedAt: null },
    });

    return restored;
  }

  async delete(userId: string, fileId: string): Promise<File> {
    await this.filePermissionService.verifyUserRole(
      fileId,
      userId,
      FilePermissionRole.EDITOR,
    );

    const scope = this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(userId)
      .filterByIsSystem(false)
      .filterByOwnerId(userId);

    const resource = await scope.getOneOrFail();

    if (resource.deletedAt) {
      if (this.fileRepository.isFolder(resource))
        throw new FolderNotFoundException(fileId);
      throw new FileNotFoundException(fileId);
    }

    const deleted = await this.fileRepository.update(
      { id: fileId },
      { deletedAt: new Date() },
    );
    const treeOwnerId = deleted.treeOwnerId;

    //mark all files under this node as deleted
    if (this.fileRepository.isFolder(deleted)) {
      await this.fileRepository.prisma.file.updateMany({
        where: {
          left: { gte: deleted.left },
          right: { lte: deleted.right },
          treeOwnerId,
        },
        data: { deletedAt: new Date() },
      });
    }

    // delete all files under this node including the node itself
    await this.queueService.enqueueDeleteFileAndChildrenFromStorage({
      treeOwnerId,
      fileId,
    });

    await this.queueService.enqueueNestedSetDeleteNode({
      nodeId: fileId,
      treeOwnerId,
    });

    // Sync user's storage usage to ensure accuracy
    await this.userService.syncStorageUsage(treeOwnerId);

    return deleted;
  }

  async getFoldersForTree(
    userId: string,
    filters: FolderFilterDto,
  ): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder(userId);
    const parentId = filters.parentId ?? root.id;
    return this.fileRepository.scoped
      .filterByParentId(parentId)
      .filterByOwnerId(userId)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .orderBy({ name: filters.order })
      .getManyPaginated(filters.page, filters.pageSize);
  }

  async getFilesUnderNode(treeOwnerId: string, nodeId: string) {
    const node = await this.fileRepository.prisma.file.findUnique({
      where: { id: nodeId, treeOwnerId },
      select: { left: true, right: true },
    });

    if (!node)
      throw new NotFoundException({
        message: `Node with ID ${nodeId} not found`,
      });

    const files = await this.fileRepository.prisma.file.findMany({
      where: {
        treeOwnerId,
        left: { gte: node.left },
        right: { lte: node.right },
        type: 'FILE',
        storagePath: { not: null },
      },
      select: {
        id: true,
        ownerId: true,
        treeOwnerId: true,
        storagePath: true,
      },
    });

    return files;
  }

  async getUserStorageInfo(userId: string) {
    const user = await this.fileRepository.prisma.user.findFirst({
      where: { id: userId },
      include: { plan: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: ErrorCode.USER_NOT_FOUND,
      });
    }

    const usagePercentage = Math.round(
      (Number(user.storageUsed) / Number(user.plan.maxStorage)) * 100,
    );

    return {
      usedStorage: Number(user.storageUsed),
      totalStorage: Number(user.plan.maxStorage),
      usagePercentage,
      planName: user.plan.nameKey,
    };
  }

  async getStorageBreakdown(userId: string) {
    // Get all files for the user grouped by content type
    const fileStats = await this.fileRepository.prisma.file.groupBy({
      by: ['contentType'],
      where: {
        treeOwnerId: userId,
        type: 'FILE',
        deletedAt: null,
      },
      _sum: {
        size: true,
      },
      _count: {
        id: true,
      },
    });

    // Initialize breakdown structure
    const breakdown = {
      images: { type: 'images', size: 0, percentage: 0, count: 0 },
      videos: { type: 'videos', size: 0, percentage: 0, count: 0 },
      documents: { type: 'documents', size: 0, percentage: 0, count: 0 },
      audio: { type: 'audio', size: 0, percentage: 0, count: 0 },
      other: { type: 'other', size: 0, percentage: 0, count: 0 },
      totalFiles: 0,
      totalSize: 0,
    };

    // Process each content type
    fileStats.forEach((stat) => {
      const contentType = stat.contentType?.toLowerCase() || '';
      const size = Number(stat._sum.size || 0);
      const count = stat._count.id;

      breakdown.totalFiles += count;
      breakdown.totalSize += size;

      // Categorize by content type
      if (contentType.startsWith('image/')) {
        breakdown.images.size += size;
        breakdown.images.count += count;
      } else if (contentType.startsWith('video/')) {
        breakdown.videos.size += size;
        breakdown.videos.count += count;
      } else if (contentType.startsWith('audio/')) {
        breakdown.audio.size += size;
        breakdown.audio.count += count;
      } else if (
        contentType.includes('pdf') ||
        contentType.includes('document') ||
        contentType.includes('spreadsheet') ||
        contentType.includes('presentation') ||
        contentType.includes('text/') ||
        contentType.includes('msword') ||
        contentType.includes('excel') ||
        contentType.includes('powerpoint') ||
        contentType.includes('opendocument')
      ) {
        breakdown.documents.size += size;
        breakdown.documents.count += count;
      } else {
        breakdown.other.size += size;
        breakdown.other.count += count;
      }
    });

    // Calculate percentages
    if (breakdown.totalSize > 0) {
      breakdown.images.percentage = Math.round(
        (breakdown.images.size / breakdown.totalSize) * 100,
      );
      breakdown.videos.percentage = Math.round(
        (breakdown.videos.size / breakdown.totalSize) * 100,
      );
      breakdown.documents.percentage = Math.round(
        (breakdown.documents.size / breakdown.totalSize) * 100,
      );
      breakdown.audio.percentage = Math.round(
        (breakdown.audio.size / breakdown.totalSize) * 100,
      );
      breakdown.other.percentage = Math.round(
        (breakdown.other.size / breakdown.totalSize) * 100,
      );
    }

    return breakdown;
  }
}
