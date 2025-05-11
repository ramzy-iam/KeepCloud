import { APP_API } from './axios';
import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';

export class StorageService {
  static async getRootItems(filters?: FolderFilterDto) {
    const { data } = await APP_API.get<PaginationDto<FileMinViewDto>>(
      'storage/my-storage',
      {
        params: filters,
      },
    );
    return data;
  }

  static async getSharedWithMe(filters: FolderFilterDto) {
    const { data } = await APP_API.get<PaginationDto<FileMinViewDto>>(
      'storage/shared-with-me',
      {
        params: filters,
      },
    );
    return data;
  }

  static async getTrashedItems(filters: FolderFilterDto) {
    const { data } = await APP_API.get<PaginationDto<FileMinViewDto>>(
      'storage/trash',
      {
        params: filters,
      },
    );
    return data;
  }
}
