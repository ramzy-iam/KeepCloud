import { APP_API } from './axios';
import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';

export class StorageService {
  static getRootItems(filters: FolderFilterDto) {
    return APP_API.get<PaginationDto<FileMinViewDto>>('storage/my-storage', {
      params: filters,
    });
  }

  static getSharedWithMe(filters: FolderFilterDto) {
    return APP_API.get<PaginationDto<FileMinViewDto>>(
      'storage/shared-with-me',
      {
        params: filters,
      },
    );
  }

  static getTrashedItems(filters: FolderFilterDto) {
    return APP_API.get<PaginationDto<FileMinViewDto>>('storage/trash', {
      params: filters,
    });
  }
}
