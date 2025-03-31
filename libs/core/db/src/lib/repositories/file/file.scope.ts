import { SelectQueryBuilder } from 'typeorm';
import { File } from '../../entities';
import { FileFormat, FileSortField } from '@keepcloud/commons/constants';
import { SortOrderType } from '@keepcloud/commons/types';

export class FileScope extends SelectQueryBuilder<File> {
  filterById(id: number) {
    return this.andWhere('File.id = :id', {
      id,
    });
  }

  filterByOwnerId(id: number) {
    return this.andWhere('File.ownerId = :id', {
      id,
    });
  }

  filterByParentId(id: number | null) {
    if (id === null) return this.andWhere('File.parentId IS NULL');
    return this.andWhere('File.parentId = :id', {
      id,
    });
  }

  filerByIsFolder(isFolder: boolean) {
    if (isFolder === undefined) return this;
    return this.andWhere('File.isFolder = :isFolder', {
      isFolder,
    });
  }

  filterByName(name: string) {
    return this.andWhere(`File.name ILIKE %:name%`, {
      name,
    });
  }

  filterByFormat(format: FileFormat) {
    return this.andWhere('File.format = :format', {
      format,
    });
  }

  filterByTemporaryDeletedAt(date: Date) {
    return this.andWhere('DATE (File.temporaryDeletedAt) = DATE(:date)', {
      date,
    });
  }

  filterByIsTemporaryDeleted(isDeleted: boolean) {
    if (isDeleted === undefined) return this;
    if (isDeleted === true)
      return this.andWhere('File.temporaryDeletedAt IS NOT NULL');

    return this.andWhere('File.temporaryDeletedAt IS NULL');
  }

  filterByPath(path: string) {
    return this.andWhere('File.path = :path', {
      path,
    });
  }

  order(
    field: string = FileSortField.CREATED_AT,
    order: SortOrderType = 'DESC'
  ) {
    return this.addOrderBy(`File.${field}`, order);
  }
}
