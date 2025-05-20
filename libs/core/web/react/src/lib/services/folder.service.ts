import { APP_API } from './axios';
import {
  CreateFolderDto,
  FolderFilterDto,
  PaginationDto,
  FileMinViewDto,
  FileDetailsDto,
  GetOneFolderQueryDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class FolderService extends BaseHttpService {
  protected baseUrl: string = 'folders';

  async create(dto: CreateFolderDto) {
    return this.post<FileMinViewDto, CreateFolderDto>('', dto);
  }

  async getChildren(id: string, filters: FolderFilterDto) {
    return this.get<PaginationDto<FileMinViewDto>>(`/${id}/children`, {
      params: filters,
    });
  }

  async getOne(
    id: string,
    query: GetOneFolderQueryDto = { withAncestors: true },
  ) {
    return this.get<FileDetailsDto>(`/${id}`, { params: query });
  }
}

export default new FolderService();
