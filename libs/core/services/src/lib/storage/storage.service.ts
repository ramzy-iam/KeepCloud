import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType } from '@keepcloud/core/db';
import { PaginationDto, FolderFilterDto } from '@keepcloud/commons/dtos';
import { ErrorCode, SYSTEM_FILE } from '@keepcloud/commons/constants';
import {
  FileNotFoundException,
  FolderNotFoundException,
  NotFoundException,
} from '@keepcloud/commons/backend';
import { SystemQueueService } from '../queues';
import { UserService } from '../user';

@Injectable()
export class StorageService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly queueService: SystemQueueService,
    private readonly userService: UserService,
  ) {}

  async getRootItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder();
    const scope = this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByNotTrashed()
      .orderBy({ isFolder: 'desc' }) //folder first
      .orderBy({ name: filters.order })
      .joinOwner();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return scope.getManyPaginated(filters.page, filters.pageSize);
  }

  async getTrashedItems(filters: FolderFilterDto) {
    // Get trashed items that are top-level (their parent is not trashed)

    const trashedFiles = await this.fileRepository.findManyPaginated(
      filters.page,
      filters.pageSize,
      {
        where: {
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

  async getSuggestedFolders(): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder();

    return this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .joinOwner()
      .orderBy({ name: 'asc' })
      .getManyPaginated(1, 15);
  }

  async getSuggestedFiles(): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder();

    return this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByType(FileType.FILE)
      .filterByNotTrashed()
      .joinOwner()
      .orderBy({ name: 'asc' })
      .getManyPaginated(1, 15);
  }

  async getFoldersForTree(
    filters: FolderFilterDto,
  ): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder();
    const parentId = filters.parentId ?? root.id;
    return this.fileRepository.scoped
      .filterByParentId(parentId)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .orderBy({ name: filters.order })
      .getManyPaginated(filters.page, filters.pageSize);
  }

  rename(id: string, name: string): Promise<File> {
    return this.fileRepository.update({ id }, { name });
  }

  async moveToTrash(id: string): Promise<File> {
    await this.fileRepository.scoped
      .filterById(id)
      .filterByIsSystem(false)
      .getOneOrFail();

    const trashedAt = new Date();
    const file = await this.fileRepository.update(
      { id },
      { trashedAt, isSystem: false },
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

  async delete(id: string): Promise<File> {
    const resource = await this.fileRepository.scoped
      .filterById(id)
      .filterByIsSystem(false)
      .getOneOrFail();

    if (resource.deletedAt) {
      if (this.fileRepository.isFolder(resource))
        throw new FolderNotFoundException(id);
      throw new FileNotFoundException(id);
    }

    const deleted = await this.fileRepository.update(
      { id },
      { deletedAt: new Date() },
    );

    //mark all files under this node as deleted
    if (this.fileRepository.isFolder(deleted)) {
      await this.fileRepository.prisma.file.updateMany({
        where: {
          left: { gte: deleted.left },
          right: { lte: deleted.right },
        },
        data: { deletedAt: new Date() },
      });
    }

    // delete all files under this node including the node itself
    await this.queueService.enqueueDeleteFileAndChildrenFromStorage({
      ownerId: deleted.ownerId,
      fileId: id,
    });

    await this.queueService.enqueueNestedSetDeleteNode({
      nodeId: id,
      ownerId: deleted.ownerId,
    });

    // Sync user's storage usage to ensure accuracy
    await this.userService.syncStorageUsage(deleted.ownerId);

    return deleted;
  }

  async restore(id: string): Promise<File> {
    await this.fileRepository.scoped
      .filterById(id)
      .filterByIsSystem(false)
      .getOneOrFail();

    const restored = await this.fileRepository.update(
      { id, isSystem: false },
      { trashedAt: null },
    );

    await this.fileRepository.prisma.file.updateMany({
      where: {
        left: { gt: restored.left },
        right: { lt: restored.right },
      },
      data: { trashedAt: null },
    });

    return restored;
  }

  async getFilesUnderNode(nodeId: string, ownerId: string) {
    const node = await this.fileRepository.prisma.file.findUnique({
      where: { id: nodeId },
      select: { left: true, right: true },
    });

    if (!node)
      throw new NotFoundException({
        message: `Node with ID ${nodeId} not found`,
      });

    const files = await this.fileRepository.prisma.file.findMany({
      where: {
        ownerId,
        left: { gte: node.left },
        right: { lte: node.right },
        type: 'FILE',
        storagePath: { not: null },
      },
      select: {
        id: true,
        ownerId: true,
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
        ownerId: userId,
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
