import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
  TrashedFileDto,
  UserStorageDto,
  StorageBreakdownDto,
  BulkDeleteDto,
  BulkDeleteResultDto,
  BulkTrashDto,
  BulkTrashResultDto,
  BulkRestoreDto,
  BulkRestoreResultDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class StorageService extends BaseHttpService {
  protected baseUrl = 'storage';

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
    return this.get<PaginationDto<TrashedFileDto>>('/trash', {
      params: filters,
    });
  }

  async getSuggestedFolders(filters: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>('/suggested-folders', {
      params: filters,
    });
  }

  async getSuggestedFiles(filters: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>('/suggested-files', {
      params: filters,
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
    return this.post<FileMinViewDto>(`/resources/${id}/restore`);
  }

  async getUserStorage() {
    return this.get<UserStorageDto>('/usage');
  }

  async getStorageBreakdown() {
    return this.get<StorageBreakdownDto>('/breakdown');
  }

  async bulkMoveToTrash(fileIds: string[]) {
    return this.post<BulkTrashResultDto[], BulkTrashDto>('/bulk/trash', {
      fileIds,
    });
  }

  async bulkRestore(fileIds: string[]) {
    return this.post<BulkRestoreResultDto[], BulkRestoreDto>('/bulk/restore', {
      fileIds,
    });
  }

  async bulkDelete(fileIds: string[]) {
    return this.post<BulkDeleteResultDto[], BulkDeleteDto>('/bulk/delete', {
      fileIds,
    });
  }
}

export default new StorageService();
