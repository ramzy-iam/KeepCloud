import { APP_API } from './axios';
import {
  CreateFolderDto,
  FolderFilterDto,
  PaginationDto,
  FileMinViewDto,
  FileDetailsDto,
  GetOneFolderQueryDto,
} from '@keepcloud/commons/dtos';

export class FolderService {
  static async create(dto: CreateFolderDto) {
    const { data } = await APP_API.post<FileMinViewDto>('folders', dto);
    return data;
  }

  static async getChildren(id: string, filters: FolderFilterDto) {
    const { data } = await APP_API.get<PaginationDto<FileMinViewDto>>(
      `folders/${id}/children`,
      {
        params: filters,
      },
    );
    return data;
  }

  static async getOne(
    id: string,
    query: GetOneFolderQueryDto = { withAncestors: true },
  ) {
    const { data } = await APP_API.get<FileDetailsDto>(`folders/${id}`, {
      params: query,
    });
    return data;
  }
}
