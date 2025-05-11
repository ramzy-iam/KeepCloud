import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType } from '@keepcloud/core/db';
import { PaginationDto, FolderFilterDto } from '@keepcloud/commons/dtos';
import { PAGINATION } from '@keepcloud/commons/constants';

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

    return scope.findManyPaginated(filters.page, filters.pageSize);
  }

  getSharedWithMe(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository
      .filterByParentId('null')
      .findManyPaginated(filters.page, filters.pageSize);
  }

  getTrashedItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository
      .filterByNotTrashed()
      .findManyPaginated(filters.page, filters.pageSize);
  }

  getSuggestedFolders(): Promise<PaginationDto<File>> {
    return this.fileRepository
      .filterByParentId(null)
      .filterByType(FileType.FOLDER)
      .filterByNotTrashed()
      .findManyPaginated(1, 15);
  }

  getSuggestedFiles(): Promise<PaginationDto<File>> {
    return this.fileRepository
      .filterByParentId(null)
      .filterByType(FileType.FILE)
      .filterByNotTrashed()
      .findManyPaginated(1, 15);
  }
}
