import { Injectable } from '@nestjs/common';
import { File, FileRepository } from '@keepcloud/core/db';
import { PaginationDto, FolderFilterDto } from '@keepcloud/commons/dtos';

@Injectable()
export class StorageService {
  constructor(protected readonly fileRepository: FileRepository) {}

  getRootItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    const scope = this.fileRepository.scoped.filterByParentId(null);

    if (filters.type) scope.filterByType(filters.type);
    if (filters.name) scope.filterByName(filters.name);
    if (filters.format) scope.filterByFormat(filters.format);

    return this.fileRepository.findManyPaginated(
      scope.where,
      filters.page,
      filters.pageSize,
    );
  }

  getSharedWithMe(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository.findManyPaginated(
      { parentId: 'null' },
      filters.page,
      filters.pageSize,
    );
  }

  getTrashedItems(filters: FolderFilterDto): Promise<PaginationDto<File>> {
    return this.fileRepository.findManyPaginated(
      { parentId: 'null' },
      filters.page,
      filters.pageSize,
    );
  }
}
