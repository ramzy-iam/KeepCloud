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

  async getSuggestedFolders() {
    return this.get<PaginationDto<FileMinViewDto>>('/suggested-folders', {
      params: { page: 1, pageSize: 10 },
    });
  }

  async getSuggestedFiles() {
    return this.get<PaginationDto<FileMinViewDto>>('/suggested-files', {
      params: { page: 1, pageSize: 15 },
    });
  }

  async getFoldersForTree(filters: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>('/tree', {
      params: filters,
    });
  }

  async rename(id: string, name: string) {
    return this.patch<FileMinViewDto, { name: string }>(
      `/resources/${id}/rename`,
      {
        name,
      },
    );
  }

  async moveToTrash(id: string) {
    return this.post<FileMinViewDto>(`/resources/${id}/trash`);
  }

  async deletePermanently(id: string) {
    return this.delete<FileMinViewDto>(`/resources/${id}`);
  }

  async restore(id: string) {
    return this.patch<FileMinViewDto>(`/resources/${id}/restore`);
  }
}

export default new StorageService();
