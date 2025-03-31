import { SelectQueryBuilder } from 'typeorm';
import { FileShare } from '../../entities';

export class FileShareScope extends SelectQueryBuilder<FileShare> {
  filterById(id: number) {
    return this.andWhere('FileShare.id = :id', {
      id,
    });
  }

  filterByFileId(id: number) {
    return this.andWhere('FileShare.fileId = :id', {
      id,
    });
  }

  filterByShareWithId(id: number) {
    return this.andWhere('FileShare.shareWithId = :id', {
      id,
    });
  }
}
