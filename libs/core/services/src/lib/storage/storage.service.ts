import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType } from '@keepcloud/core/db';
import { PaginationDto, FolderFilterDto } from '@keepcloud/commons/dtos';

@Injectable()
export class StorageService {
  constructor(protected readonly fileRepository: FileRepository) {}

  getRootItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    const scope = this.fileRepository.scoped
      .filterByParentId(null)
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

  getTrashedItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository.scoped
      .filterByNotTrashed()
      .getManyPaginated(filters.page, filters.pageSize);
  }

  getSuggestedFolders(): Promise<PaginationDto<File>> {
    return this.fileRepository.scoped
      .filterByParentId(null)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .orderBy({ name: 'asc' })
      .getManyPaginated(1, 15);
  }

  getSuggestedFiles(): Promise<PaginationDto<File>> {
    return this.fileRepository.scoped
      .filterByParentId(null)
      .filterByType(FileType.FILE)
      .filterByNotTrashed()
      .orderBy({ name: 'asc' })
      .getManyPaginated(1, 15);
  }

  getFoldersForTree(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository.scoped
      .filterByParentId(filters.parentId)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .orderBy({ name: 'asc' })
      .getManyPaginated(filters.page, filters.pageSize);
  }

  rename(id: string, name: string): Promise<File> {
    return this.fileRepository.update({ id }, { name });
  }

  moveToTrash(id: string): Promise<File> {
    return this.fileRepository.update({ id }, { trashedAt: new Date() });
  }

  delete(id: string): Promise<File> {
    return this.fileRepository.update(
      { id },
      { deletedAt: new Date(), trashedAt: null },
    );
  }

  restore(id: string): Promise<File> {
    return this.fileRepository.update({ id }, { trashedAt: null });
  }
}
