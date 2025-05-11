import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class StorageService extends BaseHttpService {
  protected baseUrl: string = 'storage';

  async getRootItems(filters?: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>('/my-storage', {
      params: filters,
    });
  }

  async getSharedWithMe(filters: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>('/shared-with-me', {
      params: filters,
    });
  }

  async getTrashedItems(filters: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>('/trash', {
      params: filters,
    });
  }
}

export default new StorageService();
