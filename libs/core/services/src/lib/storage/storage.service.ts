import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType } from '@keepcloud/core/db';
import { PaginationDto, FolderFilterDto } from '@keepcloud/commons/dtos';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import {
  FileNotFoundException,
  FolderNotFoundException,
  NotFoundException,
} from '@keepcloud/commons/backend';
import { SystemQueueService } from '../queues';

@Injectable()
export class StorageService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly queueService: SystemQueueService,
  ) {}

  async getRootItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    const root = await this.fileRepository.getRootFolder();
    const scope = this.fileRepository.scoped
      .filterByParentId(root.id)
      .filterByNotTrashed()
      .joinOwner();

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return scope.getManyPaginated(filters.page, filters.pageSize);
  }

  getSharedWithMe(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository.scoped
      .filterByParentId('null')
      .getManyPaginated(filters.page, filters.pageSize);
  }

  async getTrashedItems(filters: FolderFilterDto) {
    const data = await this.fileRepository.scoped
      .filterByTrashed()
      .filterByNotDeleted()
      .joinOwner()
      .getManyPaginated(filters.page, filters.pageSize);

    const items = data.items.map(async (item) => {
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
      ...data,
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
      .orderBy({ name: 'asc' })
      .getManyPaginated(filters.page, filters.pageSize);
  }

  rename(id: string, name: string): Promise<File> {
    return this.fileRepository.update({ id }, { name });
  }

  async moveToTrash(id: string): Promise<File> {
    const file = await this.fileRepository.update(
      { id },
      { trashedAt: new Date(), isSystem: false },
    );
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

    const filesToDelete = await this.getFilesUnderNode(id, deleted.ownerId);

    await Promise.all(
      filesToDelete.map((file) =>
        this.queueService.enqueueDeleteFileFromStorage({
          ownerId: file.ownerId,
          fileId: file.id,
          storagePath: file.storagePath as string,
        }),
      ),
    );

    await Promise.all([
      this.queueService.enqueueNestedSetDeleteNode({
        nodeId: id,
        ownerId: deleted.ownerId,
      }),
      // this.queueService.enqueueNestedSetRebuildTree(deleted.ownerId),
    ]);

    return deleted;
  }

  restore(id: string): Promise<File> {
    return this.fileRepository.update(
      { id, isSystem: false },
      { trashedAt: null },
    );
  }

  private async getFilesUnderNode(nodeId: string, ownerId: string) {
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
}
